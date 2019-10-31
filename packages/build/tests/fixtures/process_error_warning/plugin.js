const { promisify } = require('util')
const { emitWarning } = require('process')

const pTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    emitWarning('test')
    await pTimeout(0)
  },
}
