module.exports = {
  onPreBuild() {
    console.log('a'.repeat(1e7))
  },
}
