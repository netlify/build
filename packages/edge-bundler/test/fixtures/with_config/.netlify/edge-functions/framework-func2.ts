import { greet } from 'alias:helper'

export default async () => {
  const greeting = greet('framework function 2')

  return new Response(greeting)
}
