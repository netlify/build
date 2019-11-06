const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    process.kill(process.pid)
    await pSetTimeout(1e4)
  },
  build() {
    console.log('test')
  },
}
