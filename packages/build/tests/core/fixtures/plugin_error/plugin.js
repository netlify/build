module.exports = {
  onBuild() {
    throw new Error('test')
  },
}
