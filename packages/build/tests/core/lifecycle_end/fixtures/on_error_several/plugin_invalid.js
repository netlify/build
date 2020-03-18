module.exports = {
  onError({
    utils: {
      build: { failBuild },
    },
  }) {
    console.log('Plugin invalid')
    failBuild('Plugin invalid test')
  },
}
