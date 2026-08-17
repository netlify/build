export default async () =>
  new Response('hello from the server', {
    headers: { 'content-type': 'text/plain' },
  })
