import { Config } from '@netlify/edge-functions'
import { greet } from 'alias:helper'

// Accessing `Deno.env` in the global scope
if (Deno.env.get('FOO')) {
  // no-op
}

export default async () => {
  const greeting = greet('user function 1')

  return new Response(greeting)
}

export const config: Config = {
  header: {
    "x-must-be-there": true,
    "x-must-not-be-there": false,
    "x-must-match": "^(foo|bar)$",
  },
  path: '/user-func1',
}
