module.exports = {
  onBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('onBuild')
  },
  onSuccess() {
    console.log('onSuccess')
  },
}
