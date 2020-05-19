const {
  env: { LANG },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(LANG)
  },
}
