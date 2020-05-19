module.exports = {
  async onPreBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
