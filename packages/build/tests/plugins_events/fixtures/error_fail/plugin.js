export default {
  onBuild() {
    throw new Error('onBuild')
  },
  onError() {
    throw new Error('onError')
  },
}
