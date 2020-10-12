const { env, pid } = require('process')

module.exports = {
  onPreBuild() {
    env.TEST_PID = pid
  },
  onPostBuild() {},
}
