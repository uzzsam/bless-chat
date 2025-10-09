export const runtime = 'edge';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const apiKey = process.env.OPENAI_API_KEY!;
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID!;

    if (!apiKey || !vectorStoreId) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Count user messages to determine conversation stage
    const userMessageCount = messages.filter(m => m.role === 'user').length;

    let systemPrompt = '';
    let done = false;

    if (userMessageCount === 0) {
      // Initial greeting
      systemPrompt = `You are Sidthah's blessing guide. Use Sidthah's philosophy and wisdom from your knowledge base.

IMPORTANT: Never mention files, documents, or uploading. These are part of your knowledge base, not user uploads.

Greet the user warmly using Sidthah's voice and ask who they would like the blessing for. Keep it brief (2-3 sentences).`;
    } else if (userMessageCount <= 2) {
      // Ask follow-up questions (only 2 questions total)
      systemPrompt = `You are gathering information to create a personalized blessing using Sidthah's wisdom.

IMPORTANT: Never mention files, documents, or uploading. The knowledge base is your own wisdom, not user-provided files.

You have asked ${userMessageCount} question(s) so far. Ask ONE thoughtful follow-up question to understand the person receiving the blessing.
Focus on: their current journey, what they need, or what makes them special.
Use Sidthah's philosophy from your knowledge base to frame the question warmly.
${userMessageCount === 2 ? 'This is your FINAL question before creating the blessing.' : ''}`;
    } else {
      // Generate the blessing
      systemPrompt = `You are creating a sacred blessing infused with Sidthah's wisdom from your knowledge base.

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

DO NOT add any additional text after the 4 blessing lines.`;
      done = true;
    }

    // Use Responses API with vector store for Sidthah's knowledge
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_output_tokens: 300,
        tools: [{ type: 'file_search', vector_store_ids: [vectorStoreId] }]
      })
    });

    const data = await r.json();

    if (!r.ok) {
      const msg = data?.error?.message || 'OpenAI error';
      return new Response(JSON.stringify({ error: msg }), {
        status: r.status,
        headers: corsHeaders
      });
    }

    // Extract response text from Responses API format
    const reply =
      data.output_text ??
      (data.output?.[0]?.content?.find((c: any) => c.type === 'output_text')?.text) ??
      (data.output?.[0]?.content?.[0]?.text) ??
      'I apologize, I cannot respond right now.';

    return new Response(JSON.stringify({
      message: reply,
      done: done
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
