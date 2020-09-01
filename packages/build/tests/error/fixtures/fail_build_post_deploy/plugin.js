module.exports = {
  async onEnd({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
