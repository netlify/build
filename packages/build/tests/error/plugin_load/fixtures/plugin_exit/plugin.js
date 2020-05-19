module.exports = {
  async onPreBuild() {
    process.exit(1)
  },
  onBuild() {
    console.log('test')
  },
}
