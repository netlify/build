import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.56/deno-dom-wasm.ts'

export default async () => {
  const doc = new DOMParser().parseFromString('<h1>hello from deno_dom</h1>', 'text/html')
  const text = doc?.querySelector('h1')?.textContent ?? 'no heading'
  return new Response(text)
}

export const config = {
  path: '/func1',
}
