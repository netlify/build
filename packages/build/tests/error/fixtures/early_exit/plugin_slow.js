const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onBuild() {
    process.kill(process.env.TEST_PID)
    await pSetTimeout(0)
  },
}
