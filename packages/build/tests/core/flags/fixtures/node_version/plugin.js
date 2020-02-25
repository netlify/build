const {
  execPath,
  env: { TEST_NODE_PATH },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(execPath === TEST_NODE_PATH)
  },
}
