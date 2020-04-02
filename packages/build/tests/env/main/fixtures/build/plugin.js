const {
  env: { TEST },
} = require('process')

module.exports = {
  onInit() {
    console.log(TEST)
  },
}
