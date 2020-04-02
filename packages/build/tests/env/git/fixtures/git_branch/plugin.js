const {
  env: { BRANCH, HEAD },
} = require('process')

module.exports = {
  onInit() {
    console.log(BRANCH, HEAD)
  },
}
