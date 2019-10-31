const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    console.log('one')
    await pSetTimeout(0)
    console.error('two')
    await pSetTimeout(0)
    console.log('three')
  },
}
