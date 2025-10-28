// app/api/chat/route.ts
// NDJSON streaming + guarded state machine that still uses OpenAI + Vector Store
// to generate *fresh* Sidthah-style text at each step.
//
// Requires env:
//   OPENAI_API_KEY
//   OPENAI_MODEL (e.g. "gpt-4.1-mini")
//   OPENAI_VECTOR_STORE_ID (your OpenAI Vector Store with Sidthah persona/knowledge)
// Optional:
//   ORIGIN_ALLOW (e.g. "https://luckyspell.myshopify.com")
//
// Notes:
// - We proxy OpenAI Responses (SSE) and translate into NDJSON for the widget.
// - We keep the flow deterministic and short; the model is used to *phrase* messages
//   and to generate the final 5-line blessing, drawing from your vector store.
// - We sanitize user text to avoid the model drifting into uploads/images talk.

export const runtime = 'edge';

type Role = 'user' | 'assistant';
type Msg = { role: Role; content: string };

const ORIGIN = process.env.ORIGIN_ALLOW || '*';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID || '';
const API_KEY = process.env.OPENAI_API_KEY || '';

const SIDTHIES = [
  'NALAMERA', // Inner Strength
  'LUMASARA', // Happiness
  'WELAMORA', // Love
  'NIRALUMA', // Wisdom
  'RAKAWELA', // Protection
  'OLANWELA', // Healing
  'MORASARA', // Peace
] as const;

const SIDTHIE_LABEL: Record<(typeof SIDTHIES)[number], string> = {
  NALAMERA: 'Inner Strength',
  LUMASARA: 'Happiness',
  WELAMORA: 'Love',
  NIRALUMA: 'Wisdom',
  RAKAWELA: 'Protection',
  OLANWELA: 'Healing',
  MORASARA: 'Peace',
};

const SIDTHIE_EXPLAIN: Record<(typeof SIDTHIES)[number], string> = {
  NALAMERA: 'Inner steadiness and the courage to act kindly.',
  LUMASARA: 'Lightness, simple joys, a warm and easy radiance.',
  WELAMORA: 'Open heart, tenderness, the bonds of care.',
  NIRALUMA: 'Clear seeing, insight, and gentle discernment.',
  RAKAWELA: 'Safe boundaries and grounded presence.',
  OLANWELA: 'Renewal, mending, and soft restoration.',
  MORASARA: 'Quiet mind, ease, and a settled breath.',
};

// ---------- Utilities ----------

function toNDJSON(obj: any) {
  return JSON.stringify(obj) + '\n';
}
function sendND(controller: ReadableStreamDefaultController, obj: any) {
  controller.enqueue(new TextEncoder().encode(toNDJSON(obj)));
}

function titleCase(s: string) {
  return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

function scrubInput(text: string) {
  return String(text || '')
    .replace(/(image|upload|file|pdf|document)s?\b/gi, '')
    .slice(0, 2000);
}

function extractName(messages: Msg[]): string {
  const allUser = messages.filter(m => m.role === 'user').map(m => scrubInput(m.content)).join('\n');
  const m1 = allUser.match(/\b(?:my name is|i'm|i am)\s+([A-Za-zÀ-ÖØ-öø-ÿ'’\-]{2,})/i);
  if (m1) return titleCase(m1[1]);
  const m2 = allUser.match(/^\s*([A-Za-zÀ-ÖØ-öø-ÿ'’\-]{2,})\s*$/m);
  if (m2 && !/@|\./.test(m2[1])) return titleCase(m2[1]);
  return '';
}

function extractSidthieKey(messages: Msg[]): (typeof SIDTHIES)[number] | '' {
  const allUser = messages.filter(m => m.role === 'user').map(m => scrubInput(m.content)).join('\n').toUpperCase();
  for (const key of SIDTHIES) {
    if (allUser.includes(key)) return key;
  }
  for (const key of SIDTHIES) {
    if (allUser.includes(SIDTHIE_LABEL[key].toUpperCase())) return key;
  }
  return '';
}

function hasRecipientAndContext(messages: Msg[]): boolean {
  const allUser = messages.filter(m => m.role === 'user').map(m => scrubInput(m.content)).join('\n');
  const mentionsRecipient = /\b(myself|me|for me|someone|friend|partner|mum|dad|child|for\s+\w+)/i.test(allUser);
  const hasFewWords =
    /because|feels|present|means|right now|today|at this moment|i (wish|hope)/i.test(allUser) ||
    allUser.split(/\s+/).length > 6;
  return mentionsRecipient && hasFewWords;
}

type FlowState = 'ask_name' | 'ask_intent' | 'ask_context' | 'final';
function getState(messages: Msg[]): {
  state: FlowState;
  name: string;
  sidthieKey: (typeof SIDTHIES)[number] | '';
  sidthieLabel: string;
} {
  const name = extractName(messages);
  const sidthieKey = extractSidthieKey(messages);
  const sidthieLabel = sidthieKey ? SIDTHIE_LABEL[sidthieKey] : '';
  if (!name) return { state: 'ask_name', name: '', sidthieKey: '', sidthieLabel: '' };
  if (!sidthieKey) return { state: 'ask_intent', name, sidthieKey: '', sidthieLabel: '' };
  if (!hasRecipientAndContext(messages)) return { state: 'ask_context', name, sidthieKey, sidthieLabel };
  return { state: 'final', name, sidthieKey, sidthieLabel };
}

// ---------- OpenAI Responses (SSE) proxy → NDJSON ----------

async function* openAIStream(
  prompt: string,
  options?: { stopAfterText?: boolean }
): AsyncGenerator<{ type: string; text?: string; textDelta?: string }, { fullText: string }, unknown> {
  if (!API_KEY) throw new Error('OPENAI_API_KEY missing');
  const attachments = VECTOR_STORE_ID
    ? [{ vector_store_id: VECTOR_STORE_ID }]
    : [];

  const sys = [
    "You are Sidthah — warm, concise, never technical.",
    "Do *not* ask for files or images. Avoid mentioning uploads or documents.",
    "Keep responses short and calm. Use gentle, everyday language.",
  ].join(' ');

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      input: [
        { role: 'system', content: sys },
        { role: 'user', content: prompt }
      ],
      // Attach vector store for retrieval
      attachments: attachments.length ? attachments : undefined,
      tools: attachments.length ? [{ type: 'file_search' }] : undefined,
      temperature: 0.7,
      max_output_tokens: 500,
    }),
  });

  if (!res.ok || !res.body) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`OpenAI error: ${res.status} ${errTxt}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data:')) continue;

      const jsonStr = trimmed.slice(5).trim();
      try {
        const evt = JSON.parse(jsonStr);
        // Responses API events of interest:
        // - response.output_text.delta
        // - response.completed
        // - response.error
        if (evt.type === 'response.output_text.delta' && typeof evt.delta === 'string') {
          fullText += evt.delta;
          yield { type: 'delta', textDelta: evt.delta };
          if (options?.stopAfterText) { /* not used here */ }
        } else if (evt.type === 'response.error') {
          throw new Error(evt.error?.message || 'OpenAI streaming error');
        }
      } catch {
        // ignore parse issues for keepalives, etc.
      }
    }
  }

  return { fullText };
}

// Constrained prompts per state:
function promptAskName() {
  return [
    'Write two short lines:',
    'Line 1: "I am Sidthah." (exact words).',
    'Blank line.',
    'Line 2: a *very short* gentle invitation to share the first name. Keep it warm and calm.',
  ].join(' ');
}

function promptAskIntent(name: string) {
  return [
    `Address the person by name (${name}).`,
    'One sentence in a gentle tone, ~14 words: invite them to notice what feels present today.',
    'Then end the message by asking them to choose one of seven intentions (no list here).',
  ].join(' ');
}

function promptExplainAndAskContext(sidthieLabel: string, explanation: string) {
  return [
    `Write two parts:`,
    `1) "${sidthieLabel} — ${explanation}"`,
    `2) (blank line) then one calm sentence asking:`,
    `"Is the blessing for yourself or someone else? When you think of your Sidthie and the blessing, what does it mean for you at this moment?"`,
  ].join(' ');
}

function promptComposeBlessing(name: string, sidthieLabel: string) {
  return [
    `Create a 5-line blessing poem for ${name} in calm Sidthah style.`,
    `Must be exactly 5 lines.`,
    `Keep lines short to medium.`,
    `Do not add a title.`,
    `Avoid explicit religious wording; keep secular and warm.`,
    `Theme to carry: ${sidthieLabel}.`,
    `At the very end add:`,
    `EXPLANATION: one short sentence describing the essence of ${sidthieLabel}.`,
  ].join(' ');
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  let messages: Msg[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.messages)) messages = body.messages;
  } catch {}

  // sanitize user inputs to reduce drift triggers
  messages = messages.map(m => ({ ...m, content: scrubInput(m.content) }));

  const { state, name, sidthieKey, sidthieLabel } = getState(messages);
  const explain = sidthieKey ? SIDTHIE_EXPLAIN[sidthieKey] : '';

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: any) => sendND(controller, obj);

      try {
        if (state === 'ask_name') {
          // Short, varied welcome (model), but tightly constrained
          const gen = openAIStream(promptAskName());
          for await (const chunk of gen) {
            if (chunk.type === 'delta' && chunk.textDelta) {
              send({ type: 'response.output_text.delta', textDelta: chunk.textDelta });
            }
          }
          // no final yet; keep done=false
          send({ type: 'meta', done: false });
          controller.close();
          return;
        }

        if (state === 'ask_intent') {
          const gen = openAIStream(promptAskIntent(name));
          for await (const chunk of gen) {
            if (chunk.type === 'delta' && chunk.textDelta) {
              send({ type: 'response.output_text.delta', textDelta: chunk.textDelta });
            }
          }
          send({
            type: 'final',
            text: '', // text already streamed above
            done: false,
          });
          controller.close();
          return;
        }

        if (state === 'ask_context') {
          const gen = openAIStream(promptExplainAndAskContext(sidthieLabel, explain));
          for await (const chunk of gen) {
            if (chunk.type === 'delta' && chunk.textDelta) {
              send({ type: 'response.output_text.delta', textDelta: chunk.textDelta });
            }
          }
          send({
            type: 'final',
            text: '',
            done: false,
          });
          controller.close();
          return;
        }

        // FINAL: compose 5-line blessing + explanation using vector store
        const gen = openAIStream(promptComposeBlessing(name, sidthieLabel));
        let full = '';
        for await (const chunk of gen) {
          if (chunk.type === 'delta' && chunk.textDelta) {
            full += chunk.textDelta;
            // stream the poem as it forms
            send({ type: 'response.output_text.delta', textDelta: chunk.textDelta });
          }
        }

        // Parse blessing + explanation from the final text
        // Expect "EXPLANATION: ..." at the end
        let explanation = '';
        let blessing = full.trim();

        const expMatch = blessing.match(/^\s*EXPLANATION:\s*(.+)\s*$/im);
        if (expMatch) {
          explanation = expMatch[1].trim();
          blessing = blessing.replace(/^\s*EXPLANATION:.*$/im, '').trim();
        }
        // ensure 5 lines max (truncate if model was verbose)
        const lines = blessing.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 5);
        blessing = lines.join('\n');

        send({
          type: 'final',
          text: 'Your blessing is ready.',
          done: true,
          name,
          blessing,
          sidthieKey,
          sidthieExplanation: explanation || explain,
        });

        controller.close();
      } catch (e: any) {
        send({ type: 'error', message: e?.message || 'Unexpected error' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-store',
    },
  });
}
