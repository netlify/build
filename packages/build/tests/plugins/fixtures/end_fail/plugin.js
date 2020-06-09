module.exports = {
  onBuild() {
    throw new Error('onBuild')
  },
  onEnd() {
    throw new Error('onEnd')
  },
}
