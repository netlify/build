export default async () => new Response('Hello from user function 6.')

export const config = {
  pattern: '/user-func6(/.*)?',
  excludedPattern: '/user-func6/excluded',
}
