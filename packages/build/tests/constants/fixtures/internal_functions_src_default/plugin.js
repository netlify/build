'use strict'

module.exports = {
  onPreBuild({ constants: { INTERNAL_FUNCTIONS_SRC } }) {
    console.log(INTERNAL_FUNCTIONS_SRC)
  },
}
