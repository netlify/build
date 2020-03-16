module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    const error = new Error('test')
    error.test = true
    throw error
  },
}
