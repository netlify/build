import type { NetlifyPluginUtils } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('utils status types', () => {
  type StatusShow = NetlifyPluginUtils['status']['show']

  expectTypeOf<StatusShow>().toBeCallableWith({ summary: 'summary' })
  expectTypeOf<StatusShow>().toBeCallableWith({ summary: 'summary', title: 'title', text: 'text' })
})
