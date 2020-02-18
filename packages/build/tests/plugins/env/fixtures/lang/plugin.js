const {
  env: { LANG },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(LANG)
  },
}
