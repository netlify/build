const { promisify } = require('util')

const processExists = require('process-exists')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onBuild() {
    process.kill(process.env.TEST_PID)

    // Signals are async, so we need to wait for the child process to exit
    while (await processExists(process.env.TEST_PID)) {
      await pSetTimeout(1e2)
    }
  },
}
