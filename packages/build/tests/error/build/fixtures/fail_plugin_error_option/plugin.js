const getError = function () {
  return new Error('innerTest')
}

module.exports = {
  onInit({
    utils: {
      build: { failPlugin },
    },
  }) {
    const error = getError()
    failPlugin('test', { error })
    console.log('onInit')
  },
  onBuild() {
    console.log('onBuild')
  },
}
