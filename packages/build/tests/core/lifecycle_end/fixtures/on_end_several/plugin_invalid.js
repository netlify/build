module.exports = {
  name: 'netlify-plugin-invalid',
  onEnd({
    utils: {
      error: { failBuild },
    },
  }) {
    console.log('Plugin invalid')
    failBuild('Plugin invalid test')
  },
}
