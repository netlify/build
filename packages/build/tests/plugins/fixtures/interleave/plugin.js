const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

// 100ms
const LOG_TIMEOUT = 1e2

module.exports = {
  async onPreBuild() {
    console.log('one')
    await pSetTimeout(LOG_TIMEOUT)
    console.error('two')
    await pSetTimeout(LOG_TIMEOUT)
    console.log('three')
  },
}
