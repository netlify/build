export default {
  onEnd({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
