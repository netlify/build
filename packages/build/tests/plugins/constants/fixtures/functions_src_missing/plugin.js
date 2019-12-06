const pathExists = require('path-exists')

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC, await pathExists(FUNCTIONS_SRC))
  },
}
