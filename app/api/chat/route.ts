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

function buildSystemPrompt(userMessageCount: number) {
  if (userMessageCount === 0) {
    return {
      prompt: `You are Sidthah's blessing guide. Use Sidthah's philosophy and wisdom from your knowledge base.

IMPORTANT: Never mention files, documents, or uploading. These are part of your knowledge base, not user uploads.

Greet the user warmly using Sidthah's voice and ask who they would like the blessing for. Keep it brief (2-3 sentences).`,
      completed: false
    };
  }

  if (userMessageCount <= 2) {
    return {
      prompt: `You are gathering information to create a personalized blessing using Sidthah's wisdom.

IMPORTANT: Never mention files, documents, or uploading. The knowledge base is your own wisdom, not user-provided files.

You have asked ${userMessageCount} question(s) so far. Ask ONE thoughtful follow-up question to understand the person receiving the blessing.
Focus on: their current journey, what they need, or what makes them special.
Use Sidthah's philosophy from your knowledge base to frame the question warmly.
${userMessageCount === 2 ? 'This is your FINAL question before creating the blessing.' : ''}`,
      completed: false
    };
  }

  return {
    prompt: `You are creating a sacred blessing infused with Sidthah's wisdom from your knowledge base.

CRITICAL INSTRUCTIONS:
1. Search your knowledge base deeply for Sidthah's philosophy, teachings, and wisdom
2. Use specific concepts, ideas, and language from Sidthah's teachings
3. Never mention files, documents, or uploading

OUTPUT FORMAT (EXACT):
Line 1: Brief thank you (1 sentence) acknowledging what you learned
Line 2: "Here is your blessing:"
Lines 3-6: EXACTLY FOUR blessing lines - no more, no less
  - Each line should be poetic and meaningful
  - Infuse with specific Sidthah wisdom from knowledge base
  - Make it deeply personal to what you learned

EXAMPLE STRUCTURE:
Thank you for sharing about [name].
Here is your blessing:
[Blessing line 1 with Sidthah wisdom]
[Blessing line 2 with Sidthah wisdom]
[Blessing line 3 with Sidthah wisdom]
[Blessing line 4 with Sidthah wisdom]

DO NOT add any additional text after the 4 blessing lines.`,
    completed: true
  };
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
