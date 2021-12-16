export default {
  onEnd({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
