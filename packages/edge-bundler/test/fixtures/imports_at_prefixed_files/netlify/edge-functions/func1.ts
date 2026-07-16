import { getMessage } from '../../@file_prefixed_with_the_at_symbol.ts'

export default () => {
  return new Response(getMessage())
}

export const config = {
  path: '/func1',
}
