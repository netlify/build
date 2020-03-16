module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    throw new Error('test')
  },
}
