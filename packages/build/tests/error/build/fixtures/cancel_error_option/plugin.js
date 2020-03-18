const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  async onInit({
    utils: {
      build: { cancelBuild },
    },
  }) {
    const error = getError()
    cancelBuild('test', { error })
  },
}
