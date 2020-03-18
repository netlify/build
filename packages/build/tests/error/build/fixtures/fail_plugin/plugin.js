module.exports = {
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
