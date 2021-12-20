import { execPath, env } from 'process'

export default {
  onPreBuild() {
    console.log(`expect execPath to NOT equal TEST_NODE_PATH. Got '${execPath !== env.TEST_NODE_PATH}'`)
  },
}
