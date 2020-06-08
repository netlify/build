const { emitWarning } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onPreBuild() {
    emitWarning('test')
    console.log('onPreBuild')
    await pSetTimeout(1e3)
  },
}
