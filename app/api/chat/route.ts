/* app/api/chat/route.ts
   Vercel Edge route: Responses API → NDJSON proxy (streaming)
   Adds a tiny server-side state machine for Sidthah flow.
*/
import { createOpenAIClient, resolveModel, resolveVectorStoreId } from '@/lib/openai';

export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = resolveModel();
const RAW_ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGINS ||
  process.env.ALLOWED_ORIGIN ||
  '*';
const ALLOWED_ORIGINS = RAW_ALLOWED_ORIGIN
  .split(/[,\s]+/)
  .map(o => o.trim())
  .filter(Boolean);
const ALLOW_ALL_ORIGINS = ALLOWED_ORIGINS.includes('*');
const VECTOR_STORE_ID = resolveVectorStoreId();

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

function normalizeOrigin(value: string) {
  return value.replace(/\/+$/, '').toLowerCase();
}

function stripProtocol(value: string) {
  return value.replace(/^https?:\/\//i, '');
}

function matchesAllowed(origin: string, allowed: string) {
  if (allowed === '*') return true;

  const normOrigin = normalizeOrigin(origin);
  const normAllowed = normalizeOrigin(allowed);
  if (normOrigin === normAllowed) return true;

  const originHost = stripProtocol(normOrigin);
  const allowedHost = stripProtocol(normAllowed);

  if (allowedHost.startsWith('*.')) {
    const suffix = allowedHost.slice(1); // keep leading dot
    return originHost.endsWith(suffix);
  }
  return originHost === allowedHost;
}

function isOriginAllowed(origin: string | undefined) {
  if (ALLOW_ALL_ORIGINS) return true;
  if (!origin) return true;
  return ALLOWED_ORIGINS.some(allowed => matchesAllowed(origin, allowed));
}

function resolveCorsOrigin(origin: string | undefined) {
  if (ALLOW_ALL_ORIGINS) return '*';
  if (origin && isOriginAllowed(origin)) return origin;
  // fall back to first configured origin to avoid empty header
  return ALLOWED_ORIGINS[0] || '*';
}

function corsHeaders(origin?: string | null) {
  const requestOrigin = origin ?? undefined;
  const allowOrigin = resolveCorsOrigin(requestOrigin);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (!ALLOW_ALL_ORIGINS) headers.Vary = 'Origin';
  return headers;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
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

  // user chose an intent; after the next user message (context) → compose
  if (uCount >= 2) {
    return { state: 'compose_blessing', name, intentKey, intentLabel };
  }

  // otherwise prompt for context
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
  lines.push('ask_name → Offer 1–2 gentle sentences in Sidthah’s voice. Introduce yourself as Sidthah, welcome the guest, and kindly invite them to share their first name (make clear it is optional).');
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
  const origin = req.headers.get('origin');
  try {
    if (!OPENAI_API_KEY) {
      return jsonError(500, 'Missing OPENAI_API_KEY', origin);
    }

    if (!isOriginAllowed(origin ?? undefined)) {
      return jsonError(403, 'Origin not allowed', origin);
    }

    const { messages } = await req.json().catch(() => ({ messages: [] as Msg[] }));
    if (!Array.isArray(messages)) {
      return jsonError(400, 'Body must contain { messages: Array<{role, content}> }', origin);
    }

    // Derive state from the conversation so far
    const current = deriveState(messages as Msg[]);

    // Build Responses API "input" sequence
    const input: any[] = [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      { role: 'system', content: buildControllerSystemMessage(current) },
    ];

    for (const m of messages as Msg[]) {
      input.push({ role: m.role, content: m.content });
    }

    const client = createOpenAIClient();
    const tools = VECTOR_STORE_ID
      ? [{ type: 'file_search' as const, vector_store_ids: [VECTOR_STORE_ID] }]
      : undefined;

    const request: any = {
      model: MODEL,
      input,
    };

    if (tools) request.tools = tools;

    const openAIStream = await client.responses.stream(request);

    const sseStream = openAiStreamToSSE(openAIStream, current.state);

    return new Response(sseStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...corsHeaders(origin),
      },
    });
  } catch (err: any) {
    return jsonError(500, err?.message || 'Unhandled error', origin);
  }
}

/** ---- helpers ---- **/

function jsonError(status: number, message: string, origin?: string | null) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin ?? undefined) },
  });
}

type OpenAIStream = AsyncIterable<any> & {
  controller?: AbortController;
  finalResponse: () => Promise<any>;
};

function openAiStreamToSSE(stream: OpenAIStream, state: State): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let aggregated = '';
  let doneSent = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: any) => {
        controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(payload)}\n\n`));
      };

      send({ type: 'meta', state, done: false });

      try {
        for await (const event of stream) {
          switch (event?.type) {
            case 'response.output_text.delta': {
              const delta = event.delta ?? '';
              if (delta) aggregated += delta;
              if (delta) send({ type: 'response.output_text.delta', textDelta: delta });
              break;
            }
            case 'response.delta': {
              const delta = event.delta;
              if (typeof delta === 'string' && delta) {
                aggregated += delta;
                send({ type: 'response.delta', delta });
              }
              break;
            }
            case 'error':
            case 'response.error': {
              send({ type: 'error', message: String(event?.error?.message || 'Unknown error') });
              break;
            }
            default:
              break;
          }
        }

        const final = await stream.finalResponse().catch(() => null);
        const text =
          final?.output_text ??
          final?.output?.[0]?.content?.find((item: any) => item.type === 'output_text')?.text ??
          aggregated;

        if (typeof text === 'string' && text.trim()) {
          const out = text.trim();
          const done = state === 'compose_blessing';
          send({ type: 'final', text: out, done });
          send({ type: 'meta', done });
          doneSent = true;
        } else {
          send({ type: 'meta', done: state === 'compose_blessing' });
          doneSent = true;
        }
      } catch (error: any) {
        send({ type: 'error', message: error?.message || 'Stream error' });
      } finally {
        if (!doneSent) {
          send({ type: 'meta', done: state === 'compose_blessing' });
        }
        controller.close();
      }
    },
    cancel(reason) {
      stream.controller?.abort(reason);
    },
  });
}
