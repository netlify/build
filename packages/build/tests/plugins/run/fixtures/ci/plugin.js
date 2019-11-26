module.exports = {
  name: 'netlify-plugin-test',
  init() {
    console.log('a'.repeat(1e3))
  },
  build() {
    console.log('b'.repeat(1e3))
  },
}
