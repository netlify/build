'use strict'

module.exports = {
  onPreBuild({ constants: { CACHE_DIR } }) {
    console.log(CACHE_DIR)
  },
}
