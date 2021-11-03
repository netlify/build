import { expectAssignable, expectType, expectError } from 'tsd'

import { onPreBuild } from '../netlify_plugin'

const testNetlifyConfigFunctions: onPreBuild = function ({
  netlifyConfig: {
    functions: { '*': functions },
  },
}) {
  expectAssignable<string | undefined>(functions.node_bundler)
  expectType<string[] | undefined>(functions.included_files)

  if (functions.node_bundler === 'esbuild') {
    expectType<string[] | undefined>(functions.external_node_modules)
    expectType<string[] | undefined>(functions.included_files)
    expectType<string[] | undefined>(functions.ignored_node_modules)
  } else {
    expectError(functions.external_node_modules)
    expectError(functions.ignored_node_modules)
  }
}
