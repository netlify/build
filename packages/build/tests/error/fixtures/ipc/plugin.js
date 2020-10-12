const { exit } = require('process')

module.exports = {
  onPreBuild() {
    exit()
  },
  onBuild() {},
}
