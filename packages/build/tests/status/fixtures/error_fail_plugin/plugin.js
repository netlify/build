module.exports = {
  onBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('error')
  },
}
