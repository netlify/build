import { test } from 'node:test'

export default () => new Response(typeof test)

export const config = {
  path: '/func1',
}
