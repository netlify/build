export default async () =>
  new Response('Hello from user function 4. I will be cached!', {
    headers: {
      'cache-control': 'public, s-maxage=60',
    },
  })

export const config = {
  cache: 'manual',
  path: '/user-func4',
  method: ['POST', 'PUT'],
}
