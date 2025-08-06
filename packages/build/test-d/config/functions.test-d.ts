import type { NetlifyConfig } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('netlify config functions types', () => {
  type Functions = NetlifyConfig['functions']['*']

  expectTypeOf<Functions['node_bundler']>().toExtend<string | undefined>()
  expectTypeOf<Functions['included_files']>().toEqualTypeOf<string[] | undefined>()

  // available when node_bundler is 'esbuild'
  type EsbuildFunctions = Functions & { node_bundler: 'esbuild' }
  expectTypeOf<EsbuildFunctions['external_node_modules']>().toEqualTypeOf<string[] | undefined>()
  expectTypeOf<EsbuildFunctions['ignored_node_modules']>().toEqualTypeOf<string[] | undefined>()

  // NOT available when node_bundler is not 'esbuild'
  type NonEsbuildFunctions = Functions & { node_bundler: 'webpack' }
  expectTypeOf<NonEsbuildFunctions['external_node_modules']>().toBeNever()
  expectTypeOf<NonEsbuildFunctions['ignored_node_modules']>().toBeNever()
})
