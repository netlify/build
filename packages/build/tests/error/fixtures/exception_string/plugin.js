export default {
  onPreBuild() {
    // eslint-disable-next-line no-throw-literal
    throw 'test'
  },
}
