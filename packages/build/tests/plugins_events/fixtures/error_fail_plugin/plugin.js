'use strict'

module.exports = {
  onBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('onBuild')
  },
  onError() {
    console.log('onError')
  },
}
