'use strict'

module.exports = {
  onBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('onBuild')
  },
  onEnd() {
    console.log('onEnd')
  },
}
