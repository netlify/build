export default {
  onBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('onBuild')
  },
  onError() {
    console.log('onError')
  },
}
