'use strict'

module.exports = {
  onBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('onBuild')
  },
  onError() {
    console.log('onError')
  },
}
