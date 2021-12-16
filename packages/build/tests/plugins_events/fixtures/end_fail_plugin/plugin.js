export default {
  onBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('onBuild')
  },
  onEnd() {
    console.log('onEnd')
  },
}
