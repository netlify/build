module.exports = {
  onPreBuild() {
    process.exit(1)
  },
  onBuild() {
    console.log('test')
  },
}
