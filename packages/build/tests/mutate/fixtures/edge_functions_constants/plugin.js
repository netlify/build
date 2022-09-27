export const onPreBuild = function ({ netlifyConfig, constants: { EDGE_FUNCTIONS_SRC } }) {
  console.log(EDGE_FUNCTIONS_SRC === undefined)

  netlifyConfig.build.edge_functions = 'test'
}

export const onBuild = function ({ constants: { EDGE_FUNCTIONS_SRC } }) {
  console.log(EDGE_FUNCTIONS_SRC)
}
