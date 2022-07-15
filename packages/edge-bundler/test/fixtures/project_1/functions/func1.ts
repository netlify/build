import { greet } from 'alias:helper'

export default async () => {
  const greeting = greet('Jane Doe')

  return new Response(greeting)
}
