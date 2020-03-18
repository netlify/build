module.exports = {
  onEnd({
    utils: {
      build: { failBuild },
    },
  }) {
    console.log('Plugin invalid')
    failBuild('Plugin invalid test')
  },
}
