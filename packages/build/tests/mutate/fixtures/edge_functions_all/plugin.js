export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.edge_functions = [{ path: '/two', handler: 'two' }]
}

export const onBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.edge_functions)
}
