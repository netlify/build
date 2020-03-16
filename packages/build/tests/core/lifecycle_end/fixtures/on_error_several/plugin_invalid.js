module.exports = {
  name: 'netlify-plugin-invalid',
  onError({
    utils: {
      error: { failBuild },
    },
  }) {
    console.log('Plugin invalid')
    failBuild('Plugin invalid test')
  },
}
