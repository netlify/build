'use strict'

module.exports = {
  onPreBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('test')
    console.log('onPreBuild')
  },
  onBuild() {
    console.log('onBuild')
  },
}
