export default {
  onBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('onBuild')
  },
  onSuccess() {
    console.log('onSuccess')
  },
}
