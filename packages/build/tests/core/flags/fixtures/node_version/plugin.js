const {
  execPath,
  env: { TEST_NODE_PATH },
} = require('process')

module.exports = {
  onInit() {
    console.log(execPath === TEST_NODE_PATH)
  },
}
