export default async () => new Response('Hello from user function 3')

export const config = () => ({
  mode: 'not_a_supported_mode',
  path: '/user-func3',
})
