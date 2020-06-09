const pathExists = require('path-exists')

module.exports = {
  async onPreBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC, await pathExists(FUNCTIONS_SRC))
  },
}
