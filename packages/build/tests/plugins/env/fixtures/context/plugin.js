const {
  env: { CONTEXT },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(CONTEXT)
  },
}
