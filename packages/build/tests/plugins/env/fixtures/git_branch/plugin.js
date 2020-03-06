const {
  env: { BRANCH, HEAD },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(BRANCH, HEAD)
  },
}
