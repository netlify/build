export default async () => new Response('Hello from framework function 1')

export const config = () => ({
  path: '/framework-func1',
})
