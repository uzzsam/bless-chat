export const runtime = 'edge';

function cors(origin: string | null, allowed: string) {
  const ok = origin && origin === allowed;
  return {
    ok,
    headers: {
      'Access-Control-Allow-Origin': ok ? allowed : 'https://example.invalid',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin',
    }
  };
}

export async function OPTIONS(req: Request) {
  const { headers } = cors(req.headers.get('origin'), process.env.ALLOWED_ORIGIN!);
  return new Response(null, { status: 204, headers });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const { ok, headers } = cors(origin, process.env.ALLOWED_ORIGIN!);
  if (!ok) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers });

  try {
    const { recipient } = await req.json();
    if (!recipient || typeof recipient !== 'string') {
      return new Response(JSON.stringify({ error: 'recipient is required' }), { status: 400, headers });
    }

    const apiKey = process.env.OPENAI_API_KEY!;
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID!;
    if (!apiKey || !vectorStoreId) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers });
    }

    const system =
      "Generate exactly four short lines called a 'blessing'. " +
      "Warm, secular, grounded. Personalise to the named recipient. " +
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
      return new Response(JSON.stringify({ error: msg }), { status: r.status, headers });
    }

    const text =
      data.output_text ??
      (data.output?.[0]?.content?.find((c: any) => c.type === 'output_text')?.text) ??
      (data.output?.[0]?.content?.[0]?.text) ?? '';

    return new Response(JSON.stringify({ blessing: (text || '').trim() }), { status: 200, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500, headers });
  }
}
