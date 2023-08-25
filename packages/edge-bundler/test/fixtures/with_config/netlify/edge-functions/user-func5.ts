export default async () => new Response('Hello from user function 5.')

export const config = {
  path: '/user-func5/*',
  excludedPath: '/user-func5/excluded',
  method: 'get',
}
