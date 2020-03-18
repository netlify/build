module.exports = {
  onInit({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
