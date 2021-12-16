export default {
  onBuild() {
    throw new Error('onBuild')
  },
  onError() {
    console.log('onError')
  },
}
