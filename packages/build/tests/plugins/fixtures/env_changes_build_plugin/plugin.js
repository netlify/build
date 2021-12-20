import { env } from 'process'

export default {
  onPreBuild({
    netlifyConfig: {
      build: { environment },
    },
  }) {
    // eslint-disable-next-line no-param-reassign
    environment.TEST_ONE = 'one'
    // eslint-disable-next-line no-param-reassign
    environment.TEST_TWO = 'two'
  },
  onBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
  },
  onPostBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
  },
}
