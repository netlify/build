import { Config } from 'https://edge.netlify.com'

import { yell } from 'helper'
import id from 'id'
import identidade from '@pt-committee/identidade'

import { getWords } from 'dictionary'

// this will throw since FS access is not available in Edge Functions.
// but we need this line so that `dictionary` is scanned for extraneous dependencies
try {
  getWords()
} catch {}

export default () => {
  return new Response(yell(identidade(id(Deno.env.get('very_secret_secret'))) ?? ''))
}

export const config: Config = {
  path: '/my-function',
}
