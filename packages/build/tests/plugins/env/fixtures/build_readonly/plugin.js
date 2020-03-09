const {
  env: { NETLIFY },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(NETLIFY === undefined)
  },
}
