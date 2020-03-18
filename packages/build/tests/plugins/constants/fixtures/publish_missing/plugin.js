const pathExists = require('path-exists')

module.exports = {
  async onInit({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR, await pathExists(PUBLISH_DIR))
  },
}
