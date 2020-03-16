const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      build: { cancelBuild },
    },
  }) {
    const error = getError()
    cancelBuild('test', { error })
  },
}
