const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    console.log('test')
    await pSetTimeout(1e3)
  },
}
