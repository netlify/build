const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      error: { failBuild },
    },
  }) {
    const error = getError()
    failBuild('test', { error })
  },
}
