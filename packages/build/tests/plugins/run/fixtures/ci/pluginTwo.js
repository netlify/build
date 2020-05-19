module.exports = {
  onPreBuild() {
    console.log('a'.repeat(1e3))
    console.error('b'.repeat(1e3))
  },
  onBuild() {
    console.log('c'.repeat(1e3))
    console.error('d'.repeat(1e3))
  },
}
