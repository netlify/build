module.exports = {
  async onPreBuild() {
    const error = new Error('test')
    error.test = true
    throw error
  },
}
