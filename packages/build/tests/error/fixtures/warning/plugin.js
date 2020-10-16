const { emitWarning } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

// 1 second
const WARNING_TIMEOUT = 1e3

module.exports = {
  async onPreBuild() {
    emitWarning('test')
    console.log('onPreBuild')
    await pSetTimeout(WARNING_TIMEOUT)
  },
}
