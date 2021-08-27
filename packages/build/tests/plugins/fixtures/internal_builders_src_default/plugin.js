'use strict'

module.exports = {
  onPreBuild({ constants: { INTERNAL_BUILDERS_SRC } }) {
    console.log(INTERNAL_BUILDERS_SRC)
  },
}
