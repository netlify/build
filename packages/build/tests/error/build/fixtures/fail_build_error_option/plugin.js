const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  async onInit({
    utils: {
      build: { failBuild },
    },
  }) {
    const error = getError()
    failBuild('test', { error })
  },
}
