module.exports = {
  async onEnd({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
