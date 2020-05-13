module.exports = {
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
