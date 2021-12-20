export default {
  onBuild() {
    throw new Error('onBuild')
  },
  onSuccess() {
    console.log('onSuccess')
  },
}
