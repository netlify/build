module.exports = {
  onInit({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('test')
  },
}
