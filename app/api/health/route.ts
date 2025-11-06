/* app/api/health/route.ts
   Health check endpoint for monitoring
*/
export const runtime = 'edge';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    env: {
      hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
      hasVectorStore: Boolean(process.env.VECTOR_STORE_ID),
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
  };
  
  return new Response(JSON.stringify(health), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
