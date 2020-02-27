const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      build: { fail },
    },
  }) {
    const error = getError()
    fail('test', { error })
  },
}
