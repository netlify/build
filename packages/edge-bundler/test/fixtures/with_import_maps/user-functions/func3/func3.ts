import { hush } from 'helper'

export default async () => {
  const greeting = hush('HELLO, NETLIFY!')

  return new Response(greeting)
}
