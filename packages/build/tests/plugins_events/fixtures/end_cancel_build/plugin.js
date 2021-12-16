export default {
  onBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('onBuild')
  },
  onEnd() {
    console.log('onEnd')
  },
}
