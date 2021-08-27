'use strict'

module.exports = {
  onPreBuild({ constants: { BUILDERS_SRC } }) {
    console.log(BUILDERS_SRC)
  },
}
