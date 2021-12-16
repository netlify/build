export default {
  onBuild() {
    throw new Error('onBuild')
  },
  onEnd() {
    console.log('onEnd')
  },
}
