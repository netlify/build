module.exports = {
  onBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
