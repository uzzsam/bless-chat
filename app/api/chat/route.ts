export const runtime = 'edge';

const corsBaseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

const jsonHeaders = {
  ...corsBaseHeaders,
  'Content-Type': 'application/json'
};

const streamHeaders = {
  ...corsBaseHeaders,
  'Content-Type': 'application/x-ndjson'
};

const encoder = new TextEncoder();

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsBaseHeaders });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Construct the system prompt based on how many user messages have been sent.
 *
 * Conversation flow:
 *  - 0 user messages: greet and introduce Sidthah (short and warm)
 *  - 1 user message: ask for the visitor's first name (optional)
 *  - 2 user messages: present the seven Sidthies as numbered options
 *  - 3 user messages: ask if the blessing is for the visitor or someone else
 *  - 4 user messages: request details about the chosen intention and, if applicable, the recipient's name
 *  - 5 user messages: inform the visitor you are creating the blessing now
 *  - 6+ user messages: deliver the final blessing using Sidthah's wisdom
 */
function buildSystemPrompt(userMessageCount: number) {
  // Always avoid mentioning files or uploads. The knowledge base lives in the oracle.
  switch (userMessageCount) {
    case 0:
      return {
        prompt: `You are Sidthah's blessing guide. Use Sidthah's philosophy and wisdom from your knowledge base.

Introduce yourself in the first person as Sidthah. Offer a gentle, poetic welcome that is no more than one and a half sentences. Convey warmth and presence but do not ask for any details yet.`,
        completed: false
      };
    case 1:
      return {
        prompt: `You have greeted the visitor. Now ask if they would like to share their first name so you may address them personally. Be very gentle and non‑threatening. Emphasise that sharing their name is optional. Do not ask anything else. Speak in Sidthah's voice.`,
        completed: false
      };
    case 2:
      return {
        prompt: `The visitor may have shared their name. Present the seven intentions (called Sidthies) as numbered options and ask them to choose one. Provide the list exactly as follows, each on its own line:
1. Inner Strength (NALAMERA)
2. Happiness (LUMASARA)
3. Love (WELAMORA)
4. Wisdom (NIRALUMA)
5. Protection (RAKAWELA)
6. Healing (OLANWELA)
7. Peace (MORASARA)

Tell them to select by typing or tapping the option. Do not elaborate further.`,
        completed: false
      };
    case 3:
      return {
        prompt: `Ask the visitor whether the blessing is for themselves or for someone else. Use a warm, inviting tone and speak as Sidthah. Do not ask any other question.`,
        completed: false
      };
    case 4:
      return {
        prompt: `Ask the visitor to share a brief thought about the intention they selected. If the blessing is for themselves, ask what comes to mind when they think of this intention. If it is for someone else, ask for the person's first name and what comes to mind about them and the blessing. Keep the question gentle and non‑threatening.`,
        completed: false
      };
    case 5:
      return {
        prompt: `Let the visitor know you are creating their blessing now. Say something akin to: "I am creating your blessing now. Let us make the world a better place with kind words." Do not provide the blessing yet.`,
        completed: false
      };
    default:
      return {
        prompt: `You are creating a sacred blessing infused with Sidthah's wisdom from your knowledge base.

CRITICAL INSTRUCTIONS:
1. Search your knowledge base deeply for Sidthah's philosophy, teachings, and wisdom.
2. Use specific concepts, ideas, and language from Sidthah's teachings.
3. Never mention files, documents, or uploading.
4. The oracle never negotiates or offers to revise the blessing. Once spoken, it stands unchanged.

OUTPUT FORMAT (EXACT):
Line 1: Brief thank you (one sentence) acknowledging what you learned.
Line 2: "Here is your blessing:"
Lines 3–6: EXACTLY FOUR blessing lines – no more, no less.
  – Each line should be poetic and meaningful.
  – Infuse with specific Sidthah wisdom from the knowledge base.
  – Make it deeply personal to what you learned.
  – Each line must be a single sentence.

EXAMPLE STRUCTURE:
Thank you for sharing about [name or details].
Here is your blessing:
[Blessing line 1]
[Blessing line 2]
[Blessing line 3]
[Blessing line 4]

DO NOT add any additional text after the four blessing lines. Do not append suggestions, summaries, or invitations to continue.`,
        completed: true
      };
  }
}

function encodeLine(payload: unknown) {
  return encoder.encode(JSON.stringify(payload) + '\n');
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: jsonHeaders
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    if (!apiKey || !vectorStoreId) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: jsonHeaders
      });
    }

    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    const { prompt: systemPrompt, completed } = buildSystemPrompt(userMessageCount);

    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      temperature: 0.8,
      max_output_tokens: 300,
      input: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      tools: [{ type: 'file_search', vector_store_ids: [vectorStoreId] }]
    });

    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body,
      signal: req.signal
    });

    if (!upstream.ok || !upstream.body) {
      const err = await upstream.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: err?.error?.message || 'OpenAI error' }), {
        status: upstream.status,
        headers: jsonHeaders
      });
    }

    const reader = upstream.body.getReader();
    let aggregated = '';
    let finalText = '';
    let finished = false;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encodeLine({ type: 'meta', done: completed }));

        const decoder = new TextDecoder();
        let buffer = '';

        outer: while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            for (const line of event.split('\n')) {
              if (!line.startsWith('data:')) continue;
              const data = line.slice(5).trim();
              if (!data || data === '[DONE]') {
                finished = true;
                break outer;
              }

              let parsed: any;
              try {
                parsed = JSON.parse(data);
              } catch (error) {
                console.warn('Unable to parse OpenAI stream chunk', error);
                continue;
              }

              switch (parsed.type) {
                case 'response.output_text.delta': {
                  const delta = parsed.delta ?? parsed.textDelta ?? '';
                  if (delta) {
                    aggregated += delta;
                    controller.enqueue(encodeLine({ type: 'delta', text: delta }));
                  }
                  break;
                }
                case 'response.error': {
                  const message = parsed.error?.message || 'Model error';
                  controller.enqueue(encodeLine({ type: 'error', message }));
                  finished = true;
                  break outer;
                }
                case 'response.completed': {
                  const text = aggregated ||
                    parsed?.output?.[0]?.content?.find((c: any) => c.type === 'output_text')?.text ||
                    parsed?.response?.output_text?.[0]?.text || '';
                  finalText = text;
                  finished = true;
                  break outer;
                }
                default: {
                  // ignore other event types
                  break;
                }
              }
            }
          }
        }

        const resolved = (finalText || aggregated).trim();
        if (resolved) {
          controller.enqueue(encodeLine({ type: 'final', text: resolved, done: completed }));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: streamHeaders,
      status: 200
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Server error' }), {
      status: 500,
      headers: jsonHeaders
    });
  }
}
