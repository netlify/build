module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
