export default async () => new Response('Hello from user function 7.')

export const config = {
  pattern: ['/user-func7(/.*)?', '/user-func7-alt(/.*)?'],
  excludedPattern: ['/user-func7/excluded', '/user-func7-alt/excluded']
}
