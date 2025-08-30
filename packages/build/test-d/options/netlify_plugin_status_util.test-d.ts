import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('utils.status.show types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    utils.status.show({ summary: 'summary' })
    utils.status.show({ summary: 'summary', title: 'title', text: 'text' })
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
