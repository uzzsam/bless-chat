import OpenAI from 'openai';

/**
 * Create a configured OpenAI client using the current environment key.
 */
export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

/**
 * Resolve the model name, defaulting to gpt-5-nano.
 */
export function resolveModel() {
  return (process.env.OPENAI_MODEL || 'gpt-5-nano').trim();
}

/**
 * Resolve the configured vector store identifier.
 * Accept both VECTOR_STORE_ID and the legacy OPENAI_VECTOR_STORE_ID.
 */
export function resolveVectorStoreId() {
  const id = process.env.VECTOR_STORE_ID ?? process.env.OPENAI_VECTOR_STORE_ID;
  return (id || '').trim();
}
