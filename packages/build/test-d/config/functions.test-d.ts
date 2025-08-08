import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('netlifyConfig.functions types', () => {
  const handler: OnPreBuild = ({
    netlifyConfig: {
      functions: { '*': functions },
    },
  }) => {
    expectTypeOf(functions.node_bundler).toExtend<string | undefined>()
    expectTypeOf(functions.included_files).toEqualTypeOf<string[] | undefined>()

    if (functions.node_bundler === 'esbuild') {
      expectTypeOf(functions.external_node_modules).toEqualTypeOf<string[] | undefined>()
      expectTypeOf(functions.ignored_node_modules).toEqualTypeOf<string[] | undefined>()
    } else {
      expectTypeOf(functions).not.toHaveProperty('external_node_modules')
      expectTypeOf(functions).not.toHaveProperty('ignored_node_modules')
    }
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
