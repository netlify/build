export default {
  onPreBuild() {
    throw new Error('test')
  },
}
