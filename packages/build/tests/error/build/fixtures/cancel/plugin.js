module.exports = {
  async onInit({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
