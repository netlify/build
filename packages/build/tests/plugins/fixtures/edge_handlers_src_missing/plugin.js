const pathExists = require('path-exists')

module.exports = {
  async onPreBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC, await pathExists(EDGE_HANDLERS_SRC))
  },
}
