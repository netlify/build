const {
  env: { LANGUAGE },
} = require('process')

module.exports = {
  onInit() {
    console.log(LANGUAGE)
  },
}
