module.exports = {
  name: 'netlify-plugin-one',
  onInit({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('test')
    console.log('onInit')
  },
  onBuild() {
    console.log('onBuild')
  },
}
