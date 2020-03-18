module.exports = {
  async onInit() {
    process.exit(1)
  },
  onBuild() {
    console.log('test')
  },
}
