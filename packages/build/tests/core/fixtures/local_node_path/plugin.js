import { execPath, env } from 'process'

export default {
  onPreBuild() {
    console.log(`expect execPath to equal TEST_NODE_PATH. Got '${execPath === env.TEST_NODE_PATH}'`)
  },
}
