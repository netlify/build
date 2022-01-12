export const onPreBuild = function ({ netlifyConfig, constants: { EDGE_HANDLERS_SRC } }) {
  console.log(EDGE_HANDLERS_SRC === undefined)
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.build.edge_handlers = 'test'
}

export const onBuild = function ({ constants: { EDGE_HANDLERS_SRC } }) {
  console.log(EDGE_HANDLERS_SRC)
}
