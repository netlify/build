import { greet } from 'alias:helper'

export default async () => {
  const greeting = greet('user function 1')

  return new Response(greeting)
}

export const config = () => ({
  path: '/user-func1',
})
