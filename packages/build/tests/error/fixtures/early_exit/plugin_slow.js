const { env, kill } = require('process')
const { promisify } = require('util')

const processExists = require('process-exists')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onBuild() {
    kill(env.TEST_PID)

    // Signals are async, so we need to wait for the child process to exit
    // The while loop is required due to `await`
    // eslint-disable-next-line fp/no-loops, no-await-in-loop
    while (await processExists(env.TEST_PID)) {
      // eslint-disable-next-line no-await-in-loop
      await pSetTimeout(1e2)
    }
  },
}
