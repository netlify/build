import type { Config } from 'netlify:edge'

export default () => new Response('ok')

export const config: Config = {
  path: '/func1',
}
