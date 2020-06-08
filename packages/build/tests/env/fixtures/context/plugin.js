const {
  env: { CONTEXT },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(CONTEXT)
  },
}
