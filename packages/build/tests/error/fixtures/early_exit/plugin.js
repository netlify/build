import { env, pid } from 'process'

export default {
  onPreBuild() {
    env.TEST_PID = pid
  },
  onPostBuild() {},
}
