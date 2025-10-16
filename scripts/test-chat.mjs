import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnv(filename) {
  const fullPath = path.join(root, filename);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Env file not found: ${filename}`);
    return;
  }
  const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnv('env.local');
loadEnv('.env.local');

const outfile = path.join(root, '.tmp-chat-route.mjs');

await build({
  entryPoints: [path.join(root, 'app/api/chat/route.ts')],
  bundle: true,
  outfile,
  format: 'esm',
  platform: 'neutral',
  target: ['es2022'],
  sourcemap: false,
  minify: false,
});

const { POST } = await import(outfile + `?t=${Date.now()}`);

const payload = {
  messages: [
    { role: 'user', content: 'Greetings, can you craft a blessing for Elena who is starting a new journey?' }
  ]
};

const request = new Request('http://local.test/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

const response = await POST(request);
console.log('Status:', response.status, response.statusText);
console.log('Headers:', Object.fromEntries(response.headers.entries()));

const reader = response.body?.getReader();
let full = '';
if (reader) {
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    process.stdout.write(chunk);
  }
}

try {
  fs.unlinkSync(outfile);
} catch (error) {
  // ignore
}

console.log('\n--- Raw stream ---');
console.log(full);
