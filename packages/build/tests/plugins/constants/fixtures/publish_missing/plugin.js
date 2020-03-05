const pathExists = require('path-exists')

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR, await pathExists(PUBLISH_DIR))
  },
}
