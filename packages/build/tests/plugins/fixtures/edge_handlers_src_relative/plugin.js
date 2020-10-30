'use strict'

module.exports = {
  onPreBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC)
  },
}
