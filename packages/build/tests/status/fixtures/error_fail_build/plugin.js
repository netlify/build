export default {
  onBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('error')
  },
}
