import { greet } from 'alias:helper'

export default async () => {
  const greeting = greet('user function 2')

  return new Response(greeting)
}
