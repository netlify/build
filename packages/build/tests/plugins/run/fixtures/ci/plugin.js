module.exports = {
  name: 'netlify-plugin-test',
  init() {
    console.log('a'.repeat(1e3))
    console.error('b'.repeat(1e3))
  },
  build() {
    console.log('c'.repeat(1e3))
    console.error('d'.repeat(1e3))
  },
}
