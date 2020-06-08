module.exports = {
  onBuild() {
    throw new Error('onBuild')
  },
  onError() {
    throw new Error('onError')
  },
  onEnd() {
    console.log('onEnd')
  },
}
