module.exports = {
  onBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('error')
  },
}
