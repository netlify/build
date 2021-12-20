export default {
  onBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('error')
  },
}
