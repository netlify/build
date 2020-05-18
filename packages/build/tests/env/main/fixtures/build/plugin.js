const {
  env: { TEST },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(TEST)
  },
}
