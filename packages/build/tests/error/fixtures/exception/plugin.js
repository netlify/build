module.exports = {
  async onPreBuild() {
    throw new Error('test')
  },
}
