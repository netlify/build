module.exports = {
  async onPreBuild() {
    const error = new Error('test')
    error.test = true
    error.type = 'test'
    throw error
  },
}
