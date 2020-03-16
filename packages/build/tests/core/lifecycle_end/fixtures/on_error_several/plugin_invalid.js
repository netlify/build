module.exports = {
  name: 'netlify-plugin-invalid',
  onError({
    utils: {
      build: { failBuild },
    },
  }) {
    console.log('Plugin invalid')
    failBuild('Plugin invalid test')
  },
}
