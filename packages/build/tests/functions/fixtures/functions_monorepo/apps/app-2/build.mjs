import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('.netlify/v1/functions', { recursive: true });
await writeFile('.netlify/v1/functions/server.mjs', `export default async () => new Response("I am a framework server");`);
await writeFile('.netlify/v1/functions/worker.mjs', `export default async () => new Response("I am a framework worker");`);
