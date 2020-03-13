const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  name: 'netlify-plugin-one',
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
