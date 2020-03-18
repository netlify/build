const {
  env: { CONTEXT },
} = require('process')

module.exports = {
  onInit() {
    console.log(CONTEXT)
  },
}
