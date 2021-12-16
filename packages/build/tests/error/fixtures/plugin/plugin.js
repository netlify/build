export default {
  onPreBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
