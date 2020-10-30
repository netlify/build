'use strict'

module.exports = {
  onBuild() {
    throw new Error('onBuild')
  },
  onEnd() {
    console.log('onEnd')
  },
}
