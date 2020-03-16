module.exports = {
  name: 'netlify-plugin-example',
  onInit({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
