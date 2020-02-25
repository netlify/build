module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      build: { fail },
    },
  }) {
    fail('test')
  },
}
