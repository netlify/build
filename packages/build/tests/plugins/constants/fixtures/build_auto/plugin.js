const pathExists = require('path-exists')

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ constants: { BUILD_DIR } }) {
    console.log(BUILD_DIR, await pathExists(BUILD_DIR))
  },
}
