export default {
  onBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('error')
  },
}
