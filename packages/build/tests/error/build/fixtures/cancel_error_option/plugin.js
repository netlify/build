const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      build: { cancel },
    },
  }) {
    const error = getError()
    cancel('test', { error })
  },
}
