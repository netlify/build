module.exports = {
  async onInit({
    utils: {
      build: { cancel },
    },
  }) {
    cancel('test')
  },
}
