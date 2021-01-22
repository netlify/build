'use strict'

module.exports = {
  onPreBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
  },
}
