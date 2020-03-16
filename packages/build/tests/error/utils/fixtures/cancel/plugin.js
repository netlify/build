module.exports = {
  name: 'netlify-plugin-test',
  async onInit({
    utils: {
      error: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
