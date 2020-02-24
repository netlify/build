module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    process.exit(1)
  },
  onBuild() {
    console.log('test')
  },
}
