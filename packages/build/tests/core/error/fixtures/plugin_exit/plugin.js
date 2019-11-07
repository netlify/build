module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    process.exit(1)
  },
  build() {
    console.log('test')
  },
}
