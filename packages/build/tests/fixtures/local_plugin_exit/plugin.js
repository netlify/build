module.exports = {
  name: 'netlify-plugin-test',
  init() {
    process.kill(process.pid)
  },
  build() {
    console.log('test')
  },
}
