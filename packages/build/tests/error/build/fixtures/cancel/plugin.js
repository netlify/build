module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
