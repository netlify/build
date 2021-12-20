import { env } from 'process'

export default {
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
