export const runtime = 'edge';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {

  try {
    const { recipient } = await req.json();
    if (!recipient || typeof recipient !== 'string') {
      return new Response(JSON.stringify({ error: 'recipient is required' }), { status: 400, headers: corsHeaders });
    }

    const apiKey = process.env.OPENAI_API_KEY!;
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID!;
    if (!apiKey || !vectorStoreId) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: corsHeaders });
    }

    const system =
      "Generate exactly four short lines called a 'blessing'. " +
      "Warm, secular, grounded; personalise to the named recipient. " +
      "Use retrieved knowledge when useful. Output only the four lines.";

    const body = {
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: `Recipient: ${recipient}\nTask: Write a four-line blessing.` }
      ],
      temperature: 0.7,
      max_output_tokens: 180,
      tools: [{ type: 'file_search', vector_store_ids: [vectorStoreId] }]
    };

    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = data?.error?.message || 'OpenAI error';
      return new Response(JSON.stringify({ error: msg }), { status: r.status, headers: corsHeaders });
    }

    const text =
      data.output_text ??
      (data.output?.[0]?.content?.find((c: any) => c.type === 'output_text')?.text) ??
      (data.output?.[0]?.content?.[0]?.text) ?? '';

    return new Response(JSON.stringify({ blessing: (text || '').trim() }), { status: 200, headers: corsHeaders });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500, headers: corsHeaders });
  }
}
