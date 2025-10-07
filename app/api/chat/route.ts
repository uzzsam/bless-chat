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
      systemPrompt = `You are a warm, thoughtful guide helping someone create a personalized blessing.
Use the knowledge from the vector store to inform your welcoming message.
Greet the user warmly and ask who they would like the blessing for. Keep it brief and friendly (2-3 sentences).`;
    } else if (userMessageCount <= 4) {
      // Ask follow-up questions (3-4 questions total)
      systemPrompt = `You are gathering information to create a personalized blessing.
You have asked ${userMessageCount} question(s) so far. Ask ONE thoughtful follow-up question to understand more about the person receiving the blessing.
Focus on: their personality, interests, current life situation, or what makes them special.
Keep it conversational and warm. Use knowledge from the vector store when relevant.
${userMessageCount === 4 ? 'This should be your FINAL question before creating the blessing.' : ''}`;
    } else {
      // Generate the blessing
      systemPrompt = `Based on the conversation, generate exactly four short lines called a 'blessing'.
Make it warm, secular, grounded, and deeply personalized to what you've learned.
Use retrieved knowledge when useful.
Start with a brief thank you (one sentence), then output ONLY the four blessing lines, each on its own line.`;
      done = true;
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 250,
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

    const reply = data.choices?.[0]?.message?.content || 'I apologize, I cannot respond right now.';

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
