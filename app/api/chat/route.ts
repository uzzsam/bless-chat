/* app/api/chat/route.ts
   Vercel Edge route: Responses API → SSE streaming
   Optimized with explicit state tracking, tiered vector search, and email capture
*/
import { createOpenAIClient, resolveModel, resolveVectorStoreId } from '@/lib/openai';
import { buildSystemMessage, BASE_PERSONA_PROMPT } from '@/lib/prompts';
import { 
  SIDTHIES,
  SIDTHIE_KEYS, 
  SIDTHIE_LABELS,
  findSidthieByKey,
  findSidthieByLabel,
  getRandomVariation, 
  injectVariables,
  GREETING_VARIATIONS,
  NAME_REQUEST_VARIATIONS,
  SIDTHIE_SELECTION_VARIATIONS,
  CONTEXT_QUESTION_VARIATIONS
} from '@/lib/sidthies';

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

// Retry configuration removed

// Session state tracking
interface SessionState {
  state: 'ask_name' | 'ask_intent' | 'ask_context' | 'ask_email' | 'compose_blessing';
  userName?: string;
  sidthieKey?: string;
  sidthieLabel?: string;
  userEmail?: string;
  messageCount: number;
  lastUpdated: number;
}

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

// Helper to encode/decode session state
function encodeStateMarker(state: SessionState): string {
  return `[STATE:${JSON.stringify(state)}]`;
}

function extractStateFromMessages(messages: Msg[]): SessionState | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      const content = messages[i].content;
      const match = content.match(/\[STATE:({.*?})\]/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

// CORS helpers
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
    const suffix = allowedHost.slice(1);
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

// Message helpers
function firstUserMessage(messages: Msg[]): string | undefined {
  return messages.find(m => m.role === 'user')?.content;
}

function lastUserMessage(messages: Msg[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return undefined;
}

function cleanWord(w: string) {
  return w.replace(/[^\p{L}\p{M}''-]+/gu, '');
}

function extractName(messages: Msg[]): string | undefined {
  const text = firstUserMessage(messages) || '';
  const m1 = text.match(/\b(?:i am|i'm|i am called|my name is)\s+([A-Za-z][\w'-]{1,30})/i);
  if (m1) return cleanWord(m1[1]);
  const tokens = text.trim().split(/\s+/);
  const cand = tokens.find(t => /^[A-Z][a-zA-Z''-]{1,30}$/.test(t));
  return cand ? cleanWord(cand) : undefined;
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

// State machine - explicit state tracking
function determineNextState(
  messages: Msg[], 
  currentState: SessionState | null
): SessionState {
  const userMessages = messages.filter(m => m.role === 'user');
  const userCount = userMessages.length;
  
  // First message - ask for name
  if (userCount === 0 || !currentState) {
    return {
      state: 'ask_name',
      messageCount: 0,
      lastUpdated: Date.now(),
    };
  }
  
  // State transition logic (deterministic)
  switch (currentState.state) {
    case 'ask_name':
      // User provided name, move to intent selection
      if (userCount > currentState.messageCount) {
        const userName = extractName(messages);
        return {
          state: 'ask_intent',
          userName: userName || currentState.userName,
          messageCount: userCount,
          lastUpdated: Date.now(),
        };
      }
      return currentState;
      
    case 'ask_intent':
      // User selected Sidthie, move to context
      if (userCount > currentState.messageCount) {
        const { key, label } = detectIntent(messages);
        if (key && label) {
          return {
            state: 'ask_context',
            userName: currentState.userName,
            sidthieKey: key,
            sidthieLabel: label,
            messageCount: userCount,
            lastUpdated: Date.now(),
          };
        }
      }
      return currentState;
      
    case 'ask_context':
      // User provided context, move to email capture
      if (userCount > currentState.messageCount) {
        return {
          state: 'ask_email',
          userName: currentState.userName,
          sidthieKey: currentState.sidthieKey,
          sidthieLabel: currentState.sidthieLabel,
          messageCount: userCount,
          lastUpdated: Date.now(),
        };
      }
      return currentState;
      
    case 'ask_email':
      // User provided email, move to blessing
      if (userCount > currentState.messageCount) {
        const userEmail = lastUserMessage(messages);
        return {
          state: 'compose_blessing',
          userName: currentState.userName,
          sidthieKey: currentState.sidthieKey,
          sidthieLabel: currentState.sidthieLabel,
          userEmail: userEmail || undefined,
          messageCount: userCount,
          lastUpdated: Date.now(),
        };
      }
      return currentState;
      
    case 'compose_blessing':
      // Blessing complete - stay in this state (conversation ends)
      return currentState;
      
    default:
      return currentState;
  }
}

// Tiered vector search - only use when needed
function shouldUseVectorSearch(state: string): boolean {
  switch (state) {
    case 'ask_name':
      return false; // Pre-written greetings, no knowledge needed
    case 'ask_intent':
      return false; // Just listing Sidthies, no knowledge needed
    case 'ask_email':
      return false; // Simple email request
    case 'ask_context':
      return true; // Need Sidthie knowledge for mystical elaboration
    case 'compose_blessing':
      return true; // Need full knowledge for blessing creation
    default:
      return false;
  }
}

// Build controller message with pre-selected variations
function buildControllerMessage(currentState: SessionState, messages: Msg[]) {
  // Select random variations for this conversation turn
  const greetingText = currentState.state === 'ask_name' 
    ? getRandomVariation(GREETING_VARIATIONS) 
    : undefined;
    
  const nameRequestText = currentState.state === 'ask_name'
    ? getRandomVariation(NAME_REQUEST_VARIATIONS)
    : undefined;
    
  const selectionText = currentState.state === 'ask_intent' && currentState.userName
    ? injectVariables(getRandomVariation(SIDTHIE_SELECTION_VARIATIONS), { NAME: currentState.userName })
    : undefined;
    
  const contextQuestionText = currentState.state === 'ask_context' && currentState.sidthieLabel
    ? injectVariables(getRandomVariation(CONTEXT_QUESTION_VARIATIONS), { 
        SIDTHIE: currentState.sidthieLabel 
      })
    : undefined;

  return buildSystemMessage({
    state: currentState.state,
    userName: currentState.userName,
    sidthieKey: currentState.sidthieKey,
    sidthieLabel: currentState.sidthieLabel,
    userEmail: currentState.userEmail,
    userContext: lastUserMessage(messages),
    greetingText,
    nameRequestText,
    selectionText,
    contextQuestionText,
  });
}

// Retry helper removed


// Main POST handler
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

    // Determine current state (explicit tracking, no derivation)
    const previousState = extractStateFromMessages(messages as Msg[]);
    const currentState = determineNextState(messages as Msg[], previousState);

    // Build input with static base prompt + dynamic controller
    const input: any[] = [
      { role: 'system', content: BASE_PERSONA_PROMPT }, // Gets cached by OpenAI
      { role: 'system', content: buildControllerMessage(currentState, messages as Msg[]) },
    ];

    for (const m of messages as Msg[]) {
      input.push({ role: m.role, content: m.content });
    }

    const client = createOpenAIClient();

    // Tiered vector search - only when needed
    const useVectorSearch = shouldUseVectorSearch(currentState.state) && VECTOR_STORE_ID;

    const tools = useVectorSearch
      ? [{ type: 'file_search' as const, vector_store_ids: [VECTOR_STORE_ID] }]
      : undefined;

    const request: any = {
      model: MODEL,
      input,
      max_output_tokens: currentState.state === 'compose_blessing' ? 200 : 100,
    };

    if (tools) {
      request.tools = tools;
      request.tool_choice = 'auto';
    }


    // Execute stream request (streams cannot be retried - they're long-lived connections)
      const openAIStream = client.responses.stream(request);
     

    const sseStream = openAiStreamToSSE(
      openAIStream, 
      currentState.state, 
      currentState.sidthieKey,
      currentState.userEmail
    );

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
    console.error('[Bless Chat Error]', {
      message: err?.message,
      timestamp: new Date().toISOString(),
    });
    
    // User-friendly error messages
    const userMessage = err?.message?.includes('rate limit')
      ? 'The wisdom flows slowly right now. Please try again in a moment.'
      : err?.message || 'I encountered a moment of silence. Let us try once more.';
    
    return jsonError(500, userMessage, origin);
  }
}

// Helper functions
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

function openAiStreamToSSE(
  stream: OpenAIStream, 
  state: string, 
  sidthieKey?: string,
  userEmail?: string
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let aggregated = '';
  let emittedDelta = false;

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
              const delta = event?.delta ?? event?.text_delta ?? '';
              if (delta) {
                aggregated += delta;
                emittedDelta = true;
                send({ type: 'delta', textDelta: delta });
              }
              break;
            }
            case 'response.delta': {
              const delta = event?.delta;
              if (typeof delta === 'string' && delta) {
                aggregated += delta;
                emittedDelta = true;
                send({ type: 'delta', textDelta: delta });
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

        if (!emittedDelta && typeof text === 'string') {
          const out = text.trim();
          if (out) {
            aggregated = out;
            emittedDelta = true;
            send({ type: 'delta', textDelta: out });
          }
        }

        send({ 
          type: 'done', 
          meta: { 
            state, 
            sidthieKey: sidthieKey ?? null,
            userEmail: userEmail ?? null
          } 
        });
      } catch (error: any) {
        send({ type: 'error', message: error?.message || 'Stream error' });
      } finally {
        controller.close();
      }
    },
    cancel(reason) {
      stream.controller?.abort(reason);
    },
  });
}
