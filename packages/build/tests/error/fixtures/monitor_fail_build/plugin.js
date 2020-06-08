module.exports = {
  onPreBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
