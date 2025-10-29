#!/usr/bin/env node
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const model = (process.env.OPENAI_MODEL || 'gpt-5-nano').trim();
const vectorStoreId =
  (process.env.VECTOR_STORE_ID || process.env.OPENAI_VECTOR_STORE_ID || '').trim();

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

if (!vectorStoreId) {
  console.error('Missing VECTOR_STORE_ID (or legacy OPENAI_VECTOR_STORE_ID)');
  process.exit(1);
}

const client = new OpenAI({ apiKey });

async function main() {
  const prompt =
    'Say hello from the Bless Chat verification script. Keep it to one short sentence.';

  const stream = await client.responses.stream({
    model,
    input: [
      { role: 'system', content: 'You are a concise assistant for verifying connectivity.' },
      { role: 'user', content: prompt },
    ],
    tools: [{ type: 'file_search', vector_store_ids: [vectorStoreId] }],
  });

  process.stdout.write('Streaming response: ');

  for await (const event of stream) {
    if (event?.type === 'response.output_text.delta' && typeof event.delta === 'string') {
      process.stdout.write(event.delta);
    }
  }

  const final = await stream.finalResponse();
  const usage = final?.usage?.total_tokens ?? 'n/a';

  process.stdout.write('\n---\nVerification succeeded. Total tokens: ' + usage + '\n');
}

main().catch((error) => {
  console.error('\nVerification failed:', error?.message || error);
  process.exit(1);
});
