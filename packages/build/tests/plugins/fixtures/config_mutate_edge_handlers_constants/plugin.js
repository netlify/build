'use strict'

module.exports = {
  onPreBuild({ netlifyConfig, constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC === undefined)
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.edge_handlers = 'test'
  },
  onBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC)
  },
}
