export default async () => new Response('Hello from user function 1')

export const config = () => ({
  path: '/user-func1',
})
