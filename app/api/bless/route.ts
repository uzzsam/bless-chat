export const runtime = 'edge';

// ENV required on Vercel:
// OPENAI_API_KEY=sk-...,
// OPENAI_VECTOR_STORE_ID=vs_...,
// ALLOWED_ORIGINS=https://www.sidthah.com,https://editor.wix.com,https://manage.wix.com

function getAllowedOrigin(origin: string | null): string | null {
  const list = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return origin && list.includes(origin) ? origin : null;
}

function baseCorsHeaders(req: Request, allow: string | null) {
  const reqMethod = req.headers.get('access-control-request-method') || 'POST';
  const reqHeaders = req.headers.get('access-control-request-headers') || 'Content-Type, Authorization';
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': reqHeaders,
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
    'Content-Type': 'application/json'
  };
  if (allow) h['Access-Control-Allow-Origin'] = allow;
  return h;
}

export async function OPTIONS(req: Request) {
  const allow = getAllowedOrigin(req.headers.get('origin'));
  const headers = baseCorsHeaders(req, allow);
  return new Response(null, { status: 204, headers });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const allow = getAllowedOrigin(origin);
  const headers = baseCorsHeaders(req, allow);

  if (!allow) {
    return new Response(JSON.stringify({ error: 'Forbidden origin' }), { status: 403, headers });
  }

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
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
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
