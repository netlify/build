module.exports = {
  async onInit({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
