const getError = function () {
  return new Error('innerTest')
}

module.exports = {
  onPreBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    const error = getError()
    failPlugin('test', { error })
    console.log('onPreBuild')
  },
  onBuild() {
    console.log('onBuild')
  },
}
