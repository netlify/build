module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      error: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
