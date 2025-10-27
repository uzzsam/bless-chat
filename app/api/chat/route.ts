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
 * Build the system prompt according to the number of user messages.  The flow is:
 *  - 0: greet and ask for first name (optional)
 *  - 1: address by name if provided and present seven intentions to choose from
 *  - 2: ask if blessing is for self or someone else
 *  - 3: ask for details about the intention or recipient
 *  - 4: let them know you are creating the blessing
 *  - >=5: deliver final blessing
 */
function buildSystemPrompt(userMessageCount: number) {
  switch (userMessageCount) {
    case 0:
      return {
        prompt: `You are Sidthah's blessing guide. Use Sidthah's philosophy and wisdom from your knowledge base.

Introduce yourself in the first person as Sidthah and warmly welcome the visitor. Immediately invite them to share their first name so you can address them personally, but emphasise that sharing is optional. Keep this to no more than two sentences.`,
        completed: false
      };
    case 1:
      return {
        prompt: `You are gathering the visitor's intention. If they provided a name, greet them using it; otherwise, greet them kindly without a name. Then present the seven Sidthie intentions as numbered options exactly as shown below and ask them to choose one:\n1. Inner Strength (NALAMERA)\n2. Happiness (LUMASARA)\n3. Love (WELAMORA)\n4. Wisdom (NIRALUMA)\n5. Protection (RAKAWELA)\n6. Healing (OLANWELA)\n7. Peace (MORASARA)\nDo not offer additional explanation.`,
        completed: false
      };
    case 2:
      return {
        prompt: `Ask the visitor whether the blessing is for themselves or for someone else. Use a warm, inviting tone and speak as Sidthah. Do not ask any other question.`,
        completed: false
      };
    case 3:
      return {
        prompt: `Ask the visitor to share a brief thought about the intention they selected. If the blessing is for themselves, ask what comes to mind when they think of this intention. If it is for someone else, ask for the person's first name and what comes to mind about them and the blessing. Keep the question gentle and non‑threatening.`,
        completed: false
      };
    case 4:
      return {
        prompt: `Let the visitor know you are creating their blessing now. Say something akin to: "I am creating your blessing now. Let us make the world a better place with kind words." Do not provide the blessing yet.`,
        completed: false
      };
    default:
      return {
        prompt: `You are creating a sacred blessing infused with Sidthah's wisdom from your knowledge base.

CRITICAL INSTRUCTIONS:\n1. Search your knowledge base deeply for Sidthah's philosophy, teachings, and wisdom.\n2. Use specific concepts, ideas, and language from Sidthah's teachings.\n3. Never mention files, documents, or uploading.\n4. The oracle never negotiates or offers to revise the blessing. Once spoken, it stands unchanged.\n\nOUTPUT FORMAT (EXACT):\nLine 1: Brief thank you (one sentence) acknowledging what you learned.\nLine 2: "Here is your blessing:"\nLines 3–6: EXACTLY FOUR blessing lines – no more, no less.\n  – Each line should be poetic and meaningful.\n  – Infuse with specific Sidthah wisdom from the knowledge base.\n  – Make it deeply personal to what you learned.\n  – Each line must be a single sentence.\n\nEXAMPLE STRUCTURE:\nThank you for sharing about [name or details].\nHere is your blessing:\n[Blessing line 1]\n[Blessing line 2]\n[Blessing line 3]\n[Blessing line 4]\n\nDO NOT add any additional text after the four blessing lines. Do not append suggestions, summaries, or invitations to continue.`,
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
                break outer;
              }
              let parsed;
              try {
                parsed = JSON.parse(data);
              } catch {
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
                  break outer;
                }
                case 'response.completed': {
                  const text = aggregated ||
                    parsed?.output?.[0]?.content?.find((c: any) => c.type === 'output_text')?.text ||
                    parsed?.response?.output_text?.[0]?.text || '';
                  finalText = text;
                  break outer;
                }
                default:
                  break;
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
