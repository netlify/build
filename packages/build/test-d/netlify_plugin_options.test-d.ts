import type { NetlifyPluginConstants, NetlifyPluginOptions, OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'
import type { JSONValue } from '../src/types/utils/json_value.js'

test('constants types', () => {
  const handler: OnPreBuild = ({ constants }) => {
    expectTypeOf(constants).toEqualTypeOf<NetlifyPluginConstants>()
    expectTypeOf(constants.CONFIG_PATH).toEqualTypeOf<string | undefined>()
    expectTypeOf(constants.PUBLISH_DIR).toEqualTypeOf<string>()
    expectTypeOf(constants.FUNCTIONS_SRC).toEqualTypeOf<string | undefined>()
    expectTypeOf(constants.INTERNAL_EDGE_FUNCTIONS_SRC).toEqualTypeOf<string | undefined>()
    expectTypeOf(constants.INTERNAL_FUNCTIONS_SRC).toEqualTypeOf<string | undefined>()
    expectTypeOf(constants.FUNCTIONS_DIST).toEqualTypeOf<string>()
    expectTypeOf(constants.EDGE_FUNCTIONS_SRC).toEqualTypeOf<string | undefined>()
    expectTypeOf(constants.EDGE_FUNCTIONS_DIST).toEqualTypeOf<string>()
    expectTypeOf(constants.IS_LOCAL).toEqualTypeOf<boolean>()
    expectTypeOf(constants.NETLIFY_BUILD_VERSION).toEqualTypeOf<string>()
    expectTypeOf(constants.SITE_ID).toEqualTypeOf<string>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('package.json types', () => {
  const handler: OnPreBuild = ({ packageJson }) => {
    expectTypeOf(packageJson).toEqualTypeOf<NetlifyPluginOptions['packageJson']>()
    expectTypeOf(packageJson.version).toEqualTypeOf<JSONValue | undefined>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
