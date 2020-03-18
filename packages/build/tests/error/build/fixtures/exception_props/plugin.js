module.exports = {
  async onInit() {
    const error = new Error('test')
    error.test = true
    throw error
  },
}
