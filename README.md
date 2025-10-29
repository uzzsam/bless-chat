# Bless Chat

Edge streamed chatbot that powers the Shopify blessing flow.  
This repo (`bless-chat`) exposes the API and widget bundle that the Shopify storefront (`bless-shopify`) embeds.

## Prerequisites
- Node.js 18.17+ (v24 LTS works too)
- An existing OpenAI vector store with the curated Sidthah knowledge base
- Environment variables (local `.env.local`, Vercel project settings):

  ```env
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-5-nano
  VECTOR_STORE_ID=vs_...
  ALLOWED_ORIGIN=https://your-shopify-domain
  ```

  > `VECTOR_STORE_ID` replaces the older `OPENAI_VECTOR_STORE_ID` name. The server still reads the legacy name for backwards compatibility, but new deployments should prefer `VECTOR_STORE_ID`.

## Local development
1. Install dependencies once: `npm install`
2. Copy the sample env and fill in secrets: `cp example.env .env.local` (then edit)
3. Run the dev server: `npm run dev`
4. Visit `http://localhost:3000` for the demo page or `http://localhost:3000/api/chat` via curl/postman.

The widget script lives at `public/bless-chat-widget.js`. Update the TypeScript source in `widget/src/index.ts` and rebuild with `npm run build:widget` before committing so Shopify always serves the fresh bundle.

## Vector store usage
The chatbot now calls the OpenAI **Responses API** with the **File Search** tool.  
We assume the vector store already exists and is populated. The server simply reads `VECTOR_STORE_ID` and links it in each request:

```ts
const tools = [{ type: 'file_search', vector_store_ids: [vectorStoreId] }];
```

No creation/migration logic runs at runtime—if the ID is missing, the API returns an explicit 500 (“Server misconfigured”).

## Streaming behaviour
- The Next.js edge route uses `client.responses.stream()` from the official OpenAI SDK.
- Responses are re-packaged as **server-sent events** where each `data:` frame contains the legacy payload shape (`type`, `textDelta`, `meta`, etc.) so the existing widget continues to work.
- Headers are set to `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, plus the configured CORS origin(s).

## Verification script
Quick smoke test that the key + vector store work:

```bash
npm run verify:openai
```

The script streams a short prompt (“Say hello from the Sidthah store…”) and prints tokens to stdout. It exits non-zero if required env vars are missing or the API rejects the request.

## Deployments
- Pushes to `main` trigger a Vercel deploy.
- Ensure the Vercel project has the same env keys as `.env.local`.
- Shopify embeds reference:
  - Widget: `https://<vercel-domain>/bless-chat-widget.js`
  - API: `https://<vercel-domain>/api/chat`

After updating either the API or widget, allow the deploy to finish and then refresh the Shopify section to pick up the new code.
