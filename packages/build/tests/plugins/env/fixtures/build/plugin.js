const {
  env: { TEST },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(TEST)
  },
}
