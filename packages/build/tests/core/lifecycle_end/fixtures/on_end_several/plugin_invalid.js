module.exports = {
  name: 'netlify-plugin-invalid',
  onEnd({
    utils: {
      build: { failBuild },
    },
  }) {
    console.log('Plugin invalid')
    failBuild('Plugin invalid test')
  },
}
