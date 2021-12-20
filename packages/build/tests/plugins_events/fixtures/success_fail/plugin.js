export default {
  onBuild() {
    console.log('onBuild')
  },
  onSuccess() {
    throw new Error('onSuccess')
  },
}
