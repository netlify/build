module.exports = {
  name: 'netlify-plugin-one',
  onInit({
    utils: {
      error: { failPlugin },
    },
  }) {
    failPlugin('test')
    console.log('onInit')
  },
  onBuild() {
    console.log('onBuild')
  },
}
