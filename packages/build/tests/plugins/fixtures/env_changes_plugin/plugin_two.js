import { env } from 'process'

export default {
  onPreBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
  },
  onBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)

    delete env.TEST_ONE
    env.TEST_TWO = 'twoChanged'
  },
}
