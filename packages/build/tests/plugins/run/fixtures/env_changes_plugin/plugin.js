const { env } = require('process')

module.exports = {
  onPreBuild() {
    env.TEST_ONE = 'one'
    env.TEST_TWO = 'two'
  },
  onBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
  },
  onPostBuild() {
    console.log(typeof env.TEST_ONE, env.TEST_TWO, env.LANG)
  },
}
