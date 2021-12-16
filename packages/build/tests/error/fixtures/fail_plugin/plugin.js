export default {
  onPreBuild({
    utils: {
      build: { failPlugin },
    },
  }) {
    failPlugin('test')
    console.log('onPreBuild')
  },
  onBuild() {
    console.log('onBuild')
  },
}
