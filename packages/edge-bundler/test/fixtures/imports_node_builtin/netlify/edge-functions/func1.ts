import assert from 'assert'
import process from 'process'

export default () => {
  Deno.env.set('NETLIFY_TEST', '12345')
  assert.deepEqual(process.env.NETLIFY_TEST, '12345')

  return new Response('ok')
}

export const config = {
  path: '/func1',
}
