export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.edge_functions = [{ path: '/test-test', function: 'mutated-function' }]
}
