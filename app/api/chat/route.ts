/* app/api/chat/route.ts
   Vercel Edge route: Responses API → NDJSON proxy (streaming)
*/
export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-nano-2025-08-07';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID || '';

/** Minimal Sidthah persona — keep short; long prompts slow first token */
const SYSTEM_PROMPT = `
You are *Sidthah*, a gentle, grounded guide that draws on collective human
knowledge to offer short, meaningful reflections. Keep replies concise,
warm, and clear. Never ask for images or files. When user picks a "Sidthie"
(intent), acknowledge briefly and proceed to craft a 5-line blessing when asked.
`.trim();

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return jsonError(500, 'Missing OPENAI_API_KEY');
    }

    const { messages } = await req.json().catch(() => ({ messages: [] as Msg[] }));
    if (!Array.isArray(messages)) {
      return jsonError(400, 'Body must contain { messages: Array<{role, content}> }');
    }

    // Build Responses API "input" sequence
    const input: any[] = [{ role: 'system', content: SYSTEM_PROMPT }];

    for (const m of messages as Msg[]) {
      const entry: any = { role: m.role, content: m.content };
      // Attach vector store to USER messages only (if provided)
      if (VECTOR_STORE_ID && m.role === 'user') {
        entry.attachments = [{ vector_store_id: VECTOR_STORE_ID }];
      }
      input.push(entry);
    }

    // Call OpenAI Responses API with streaming enabled
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        // We want plain text out; function-calls/tool-use still supported when needed
        response_format: { type: 'text' },
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const err = await safeJson(upstream);
      return jsonError(upstream.status, err?.error?.message || 'Upstream error');
    }

    // Convert OpenAI SSE stream → NDJSON lines that the widget understands
    const ndjsonStream = sseToNdjson(upstream.body);

    return new Response(ndjsonStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store',
        ...corsHeaders(),
      },
    });
  } catch (err: any) {
    return jsonError(500, err?.message || 'Unhandled error');
  }
}

/** ---- helpers ---- **/

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

async function safeJson(r: Response) {
  try {
    return await r.clone().json();
  } catch {
    return null;
  }
}

/**
 * OpenAI Responses API streams as SSE (event/data lines).
 * We repackage into NDJSON lines with types the widget already supports:
 *  - response.output_text.delta  { textDelta }
 *  - response.delta              { delta }          // generic future-proof
 *  - meta                        { done: boolean }
 *  - final                       { text, done }
 *  - error                       { message }
 */
function sseToNdjson(readable: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let aggregated = '';
  let finalText = '';
  let doneFlag = false;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const reader = readable.getReader();
      let buffer = '';

      const pushLine = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

      const pump = async (): Promise<void> => {
        try {
          const { done, value } = await reader.read();
          if (done) {
            // Close with meta + final if we captured anything
            if (finalText || aggregated) {
              pushLine({ type: 'final', text: finalText || aggregated, done: doneFlag || true });
            } else {
              pushLine({ type: 'meta', done: true });
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          // SSE frames are separated by \n\n with "data:" lines (and sometimes "event:")
          const frames = buffer.split('\n\n');
          buffer = frames.pop() || '';

          for (const frame of frames) {
            const lines = frame.split('\n');
            let eventType = 'message';
            let dataLine = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataLine += line.slice(5).trim();
              }
            }

            if (!dataLine) continue;
            if (dataLine === '[DONE]') {
              doneFlag = true;
              continue;
            }

            let payload: any;
            try {
              payload = JSON.parse(dataLine);
            } catch {
              // Forward raw as generic delta
              pushLine({ type: 'response.delta', delta: dataLine });
              continue;
            }

            // Responses API events commonly provide output_text deltas
            if (payload.type === 'response.output_text.delta' && typeof payload.text_delta === 'string') {
              aggregated += payload.text_delta;
              pushLine({ type: 'response.output_text.delta', textDelta: payload.text_delta });
            }
            // Some models emit generic response deltas
            else if (payload.type === 'response.delta' && typeof payload.delta === 'string') {
              aggregated += payload.delta;
              pushLine({ type: 'response.delta', delta: payload.delta });
            }
            // Final text (some SDKs emit as response.completed with full output)
            else if (payload.type === 'response.completed' && typeof payload.response?.output_text === 'string') {
              finalText = payload.response.output_text;
            }
            // Meta/stop
            else if (payload.type === 'response.completed' || payload.type === 'response.stop') {
              doneFlag = true;
            }
            // Error passthrough
            else if (payload.error) {
              pushLine({ type: 'error', message: String(payload.error?.message || 'Unknown error') });
            }
          }

          // Flush meta updates periodically
          pushLine({ type: 'meta', done: false });
          pump();
        } catch (e: any) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message: e?.message || 'Stream error' }) + '\n'));
          controller.close();
        }
      };

      pump();
    },
  });
}
