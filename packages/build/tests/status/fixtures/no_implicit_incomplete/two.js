'use strict'

module.exports = {
  onPreBuild() {
    throw new Error('onPreBuild')
  },
}
