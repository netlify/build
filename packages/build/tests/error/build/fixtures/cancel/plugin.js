module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      build: { cancel },
    },
  }) {
    cancel('test')
  },
}
