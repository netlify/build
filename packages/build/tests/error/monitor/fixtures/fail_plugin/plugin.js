module.exports = {
  onPreBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('test')
  },
}
