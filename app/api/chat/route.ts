/* app/api/chat/route.ts
   Vercel Edge route: Responses API → NDJSON proxy (streaming)
   Adds a tiny server-side state machine for Sidthah flow.
*/
export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim(); // env-driven, safe fallback
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const VECTOR_STORE_ID = (process.env.OPENAI_VECTOR_STORE_ID || '').trim();

/** Persona + guardrails kept short for first-token speed */
const BASE_SYSTEM_PROMPT = `
You are *Sidthah*, a gentle, grounded guide. Keep messages short, warm, clear.
Never ask for images or files. Do not repeat yourself. Avoid headings.
When asked to compose a blessing, output EXACTLY 5 lines (no title, no extra text).
`.trim();

/** Sidthies list + short explanations (used in ask_context + product mapping) */
const SIDTHIES = [
  { key: 'NALAMERA',  label: 'Inner Strength',  short: 'A steady courage that rises quietly from within.' },
  { key: 'LUMASARA',  label: 'Happiness',       short: 'A soft, luminous joy that brightens the ordinary.' },
  { key: 'WELAMORA',  label: 'Love',            short: 'A tender presence that listens and embraces.' },
  { key: 'NIRALUMA',  label: 'Wisdom',          short: 'A calm clarity that sees the path with kindness.' },
  { key: 'RAKAWELA',  label: 'Protection',      short: 'A gentle guard that shelters what is precious.' },
  { key: 'OLANWELA',  label: 'Healing',         short: 'A quiet mending that restores balance and breath.' },
  { key: 'MORASARA',  label: 'Peace',           short: 'A stillness that settles and softens the heart.' },
];

const SIDTHIE_KEYS   = new Set(SIDTHIES.map(s => s.key));
const SIDTHIE_LABELS = new Set(SIDTHIES.map(s => s.label.toLowerCase()));

/** Conversation states */
type State = 'unknown' | 'ask_name' | 'ask_intent' | 'ask_context' | 'compose_blessing';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

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

/* ---------------- State Machine Helpers ---------------- */

function firstUserMessage(messages: Msg[]): string | undefined {
  return messages.find(m => m.role === 'user')?.content;
}

function lastUserMessage(messages: Msg[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return undefined;
}

function extractName(messages: Msg[]): string | undefined {
  const text = firstUserMessage(messages) || '';
  // Try: "I'm X", "I am X", "My name is X", else first capitalized token
  const m1 = text.match(/\b(?:i am|i’m|i am called|my name is)\s+([A-Za-z][\w'-]{1,30})/i);
  if (m1) return cleanWord(m1[1]);
  const tokens = text.trim().split(/\s+/);
  const cand = tokens.find(t => /^[A-Z][a-zA-Z'’-]{1,30}$/.test(t));
  return cand ? cleanWord(cand) : undefined;
}

function cleanWord(w: string) {
  return w.replace(/[^\p{L}\p{M}'’-]+/gu, '');
}

function detectIntent(messages: Msg[]): { key?: string; label?: string } {
  const txt = (lastUserMessage(messages) || '').trim();
  const upper = txt.toUpperCase();
  if (SIDTHIE_KEYS.has(upper)) {
    const s = SIDTHIES.find(x => x.key === upper)!;
    return { key: s.key, label: s.label };
  }
  const lower = txt.toLowerCase();
  for (const s of SIDTHIES) {
    if (lower.includes(s.label.toLowerCase())) {
      return { key: s.key, label: s.label };
    }
  }
  return {};
}

function countUserMessages(messages: Msg[]): number {
  return messages.filter(m => m.role === 'user').length;
}

/** Derive state:
 * 0 user msgs → ask_name
 * 1 user msg (name) but no intent → ask_intent
 * After user chooses intent → ask_context
 * After another user msg (context) → compose_blessing
 */
function deriveState(messages: Msg[]): { state: State; name?: string; intentKey?: string; intentLabel?: string } {
  const uCount = countUserMessages(messages);
  if (uCount <= 0) return { state: 'ask_name' };

  const name = extractName(messages);

  const { key: intentKey, label: intentLabel } = detectIntent(messages);
  if (!intentKey) {
    // user has written once (likely their name) but not chosen an intent yet
    return { state: 'ask_intent', name };
  }

  // user chose an intent; if there are 2+ user messages, assume context was provided
  if (uCount >= 2) {
    return { state: 'compose_blessing', name, intentKey, intentLabel };
  }

  return { state: 'ask_context', name, intentKey, intentLabel };
}

function sidthieShort(key?: string): string {
  if (!key) return '';
  const s = SIDTHIES.find(x => x.key === key);
  return s ? s.short : '';
}

function numberedSidthieList(): string {
  // Numbered 1..7 so your widget converts to buttons
  return SIDTHIES
    .map((s, i) => `${i + 1}. ${s.label} (${s.key})`)
    .join('\n');
}

/** Build a strict controller message the model must follow */
function buildControllerSystemMessage(current: ReturnType<typeof deriveState>) {
  const lines: string[] = [];
  lines.push(`CURRENT_STATE: ${current.state}`);
  if (current.name) lines.push(`USER_NAME: ${current.name}`);
  if (current.intentKey) lines.push(`SIDTHIE_KEY: ${current.intentKey}`);
  if (current.intentLabel) lines.push(`SIDTHIE_LABEL: ${current.intentLabel}`);
  lines.push('');
  lines.push('RULES:');
  lines.push('- Reply briefly in Sidthah style; never ask for or mention images/files.');
  lines.push('- Do not add headings. Keep friendly and calm.');
  lines.push('- Follow the state actions EXACTLY. No extra questions.');
  lines.push('');
  lines.push('ACTIONS BY STATE:');
  lines.push('ask_name → Say: "I am Sidthah, ..." then a blank line, then "Would you share your name?" (and nothing else).');
  lines.push('ask_intent → Say: `As you breathe, notice what feels most present today, {name}.` then list exactly these seven options on separate numbered lines (1..7) so the UI renders them as buttons:');
  lines.push(numberedSidthieList());
  lines.push('ask_context → Briefly (1 sentence) reflect the chosen Sidthie in plain words, then a blank line, then: "Is the blessing for yourself or someone else? When you think of your Sidthie and the blessing, what feels most present at this moment?"');
  lines.push('compose_blessing → Output ONLY the 5-line blessing, no titles, no preface, no afterword. Exactly 5 lines. Each line ≤ ~80 characters. Then stop.');
  lines.push('');
  lines.push('IMPORTANT: If CURRENT_STATE is compose_blessing, do not ask any further questions.');
  return lines.join('\n');
}

/* ---------------- Route Handler ---------------- */

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return jsonError(500, 'Missing OPENAI_API_KEY');
    }

    const { messages } = await req.json().catch(() => ({ messages: [] as Msg[] }));
    if (!Array.isArray(messages)) {
      return jsonError(400, 'Body must contain { messages: Array<{role, content}> }');
    }

    // Derive state from the conversation so far
    const current = deriveState(messages as Msg[]);

    // Build Responses API "input" sequence
    const input: any[] = [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      { role: 'system', content: buildControllerSystemMessage(current) },
    ];

    for (const m of messages as Msg[]) {
      const entry: any = { role: m.role, content: m.content };
      // Attach vector store to USER messages only (if provided)
      if (VECTOR_STORE_ID && m.role === 'user') {
        entry.attachments = [{ vector_store_id: VECTOR_STORE_ID }];
      }
      input.push(entry);
    }

    // Call OpenAI Responses API with streaming enabled (SSE)
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        stream: true,
        // keep default text output; function/tool use not needed here
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const err = await safeJson(upstream);
      return jsonError(upstream.status, err?.error?.message || 'Upstream error');
    }

    // Convert OpenAI SSE stream → NDJSON lines that the widget understands
    const ndjsonStream = sseToNdjson(upstream.body, current.state);

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
 *
 * If state === 'compose_blessing', we mark done=true on stream end,
 * so the widget dispatches `blessing:ready` and reveals the poem.
 */
function sseToNdjson(readable: ReadableStream<Uint8Array>, state: State): ReadableStream<Uint8Array> {
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
            // If we were composing the blessing, signal done:true
            const doneOut = state === 'compose_blessing' ? true : (doneFlag || true);
            if (finalText || aggregated) {
              // Strip trailing whitespace just in case
              const out = (finalText || aggregated).trim();
              pushLine({ type: 'final', text: out, done: doneOut });
            } else {
              pushLine({ type: 'meta', done: doneOut });
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          // SSE frames separated by \n\n with "data:" lines (and sometimes "event:")
          const frames = buffer.split('\n\n');
          buffer = frames.pop() || '';

          for (const frame of frames) {
            const lines = frame.split('\n');
            let dataLine = '';

            for (const line of lines) {
              if (line.startsWith('data:')) dataLine += line.slice(5).trim();
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

            if (payload.type === 'response.output_text.delta' && typeof payload.text_delta === 'string') {
              aggregated += payload.text_delta;
              pushLine({ type: 'response.output_text.delta', textDelta: payload.text_delta });
            } else if (payload.type === 'response.delta' && typeof payload.delta === 'string') {
              aggregated += payload.delta;
              pushLine({ type: 'response.delta', delta: payload.delta });
            } else if (payload.type === 'response.completed' && typeof payload.response?.output_text === 'string') {
              finalText = payload.response.output_text;
            } else if (payload.type === 'response.completed' || payload.type === 'response.stop') {
              doneFlag = true;
            } else if (payload.error) {
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
