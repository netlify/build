module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    throw new Error('test')
  },
}
