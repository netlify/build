const {
  env: { LANG },
} = require('process')

module.exports = {
  onInit() {
    console.log(LANG)
  },
}
