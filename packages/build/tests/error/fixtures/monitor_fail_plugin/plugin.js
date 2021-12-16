export default {
  onPreBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('test')
  },
}
