export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.edge_functions = [{ path: '/test-test', function: 'mutated-function' }]
}
