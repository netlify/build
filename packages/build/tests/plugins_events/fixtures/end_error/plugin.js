'use strict'

module.exports = {
  onBuild() {
    throw new Error('onBuild')
  },
  onError() {
    console.log('onError')
  },
  onEnd() {
    console.log('onEnd')
  },
}
