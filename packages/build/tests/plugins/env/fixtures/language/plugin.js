const {
  env: { LANGUAGE },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(LANGUAGE)
  },
}
