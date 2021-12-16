export default {
  onPreBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
