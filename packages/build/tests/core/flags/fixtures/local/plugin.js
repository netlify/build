const {
  execPath,
  env: { TEST_NODE_PATH },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(`expect execPath to equal TEST_NODE_PATH. Got '${execPath === TEST_NODE_PATH}'`)
  },
}
