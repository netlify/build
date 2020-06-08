module.exports = {
  async onPreBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
