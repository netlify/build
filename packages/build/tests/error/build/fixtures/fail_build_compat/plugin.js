module.exports = {
  async onInit({
    utils: {
      build: { fail },
    },
  }) {
    fail('test')
  },
}
