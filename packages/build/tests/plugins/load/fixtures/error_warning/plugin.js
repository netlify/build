const { emitWarning } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    emitWarning('test')
    console.log('init')
    await pSetTimeout(0)
  },
}
