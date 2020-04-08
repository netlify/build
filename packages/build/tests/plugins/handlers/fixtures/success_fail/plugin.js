module.exports = {
  onBuild() {
    console.log('onBuild')
  },
  onSuccess() {
    throw new Error('onSuccess')
  },
}
