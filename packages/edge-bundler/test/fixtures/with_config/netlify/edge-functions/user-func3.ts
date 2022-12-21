export default async () => new Response('Hello from user function 3')

export const config = {
  cache: 'not_a_supported_value',
  path: '/user-func3',
}
