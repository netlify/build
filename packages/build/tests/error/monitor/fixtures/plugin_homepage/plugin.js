module.exports = {
  onPreBuild() {
    throw new Error('test')
  },
}
