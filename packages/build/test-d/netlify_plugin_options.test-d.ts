import type { NetlifyPluginConstants, NetlifyPluginOptions } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'
import type { JSONValue } from '../src/types/utils/json_value.js'

test('constants types', () => {
  expectTypeOf<NetlifyPluginConstants['CONFIG_PATH']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<NetlifyPluginConstants['PUBLISH_DIR']>().toEqualTypeOf<string>()
  expectTypeOf<NetlifyPluginConstants['FUNCTIONS_SRC']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<NetlifyPluginConstants['INTERNAL_EDGE_FUNCTIONS_SRC']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<NetlifyPluginConstants['INTERNAL_FUNCTIONS_SRC']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<NetlifyPluginConstants['FUNCTIONS_DIST']>().toEqualTypeOf<string>()
  expectTypeOf<NetlifyPluginConstants['EDGE_FUNCTIONS_SRC']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<NetlifyPluginConstants['EDGE_FUNCTIONS_DIST']>().toEqualTypeOf<string>()
  expectTypeOf<NetlifyPluginConstants['IS_LOCAL']>().toEqualTypeOf<boolean>()
  expectTypeOf<NetlifyPluginConstants['NETLIFY_BUILD_VERSION']>().toEqualTypeOf<string>()
  expectTypeOf<NetlifyPluginConstants['SITE_ID']>().toEqualTypeOf<string>()
})

test('package json types', () => {
  expectTypeOf<NetlifyPluginOptions['packageJson']['version']>().toEqualTypeOf<JSONValue | undefined>()
})
