import { env } from 'process'

export default {
  onPreBuild() {
    env.TEST_ONE = 'one'
    env.TEST_TWO = 'two'
    delete env.LANGUAGE
  },
}
