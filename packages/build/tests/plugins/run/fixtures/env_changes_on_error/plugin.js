const { env } = require('process')

module.exports = {
  onPreBuild() {
    env.TEST_ONE = 'one'
  },
  onBuild() {
    console.log(env.TEST_ONE)
    throw new Error('onBuild')
  },
  onError() {
    console.log(env.TEST_ONE)
  },
  onEnd() {
    console.log(env.TEST_ONE)
  },
}
