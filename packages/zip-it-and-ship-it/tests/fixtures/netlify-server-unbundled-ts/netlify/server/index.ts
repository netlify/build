import type { Greeting } from './types.ts'
import { greet } from './greeting.ts'
import { loadPunctuation } from './loader.js'

const { punctuate } = await loadPunctuation()
const greeting: Greeting = { message: punctuate(greet('server').message) }

export default {
  async fetch(): Promise<Response> {
    return Response.json(greeting)
  },
}
