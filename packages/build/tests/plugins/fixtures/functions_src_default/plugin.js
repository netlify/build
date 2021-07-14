'use strict'

module.exports = {
  onPreBuild({ constants: { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
    console.log(INTERNAL_FUNCTIONS_SRC)
  },
}
