export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.edge_functions = [{ path: '/two', function: 'two' }]
}

export const onBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.edge_functions)
}
