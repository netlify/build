import { Config } from 'https://edge.netlify.com'

import { yell } from 'helper'

export default () => new Response(yell(Deno.env.get('very_secret_secret') ?? ''))

export const config: Config = () => ({
  path: '/my-function',
})
