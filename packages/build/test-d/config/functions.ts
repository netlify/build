import { expectAssignable, expectType, expectError } from 'tsd'

import { onPreBuild } from '../netlify_plugin'

const testNetlifyConfigFunctions: onPreBuild = function ({
  netlifyConfig: {
    functions: { '*': functions },
  },
}) {
  expectType<string>(functions.directory)
  expectAssignable<string>(functions.node_bundler)

  if (functions.node_bundler === 'esbuild') {
    expectType<string[]>(functions.external_node_modules)
    expectType<string[]>(functions.included_files)
    expectType<string[]>(functions.ignored_node_modules)
  } else {
    expectError(functions.external_node_modules)
    expectError(functions.included_files)
    expectError(functions.ignored_node_modules)
  }
}
