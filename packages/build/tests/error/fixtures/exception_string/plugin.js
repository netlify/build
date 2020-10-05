module.exports = {
  onPreBuild() {
    // eslint-disable-next-line no-throw-literal
    throw 'test'
  },
}
