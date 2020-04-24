module.exports = {
  onInit({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
