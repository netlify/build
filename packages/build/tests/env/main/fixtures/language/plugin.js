const {
  env: { LANGUAGE },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(LANGUAGE)
  },
}
