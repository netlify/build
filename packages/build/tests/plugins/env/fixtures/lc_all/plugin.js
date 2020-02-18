const {
  env: { LC_ALL },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(LC_ALL)
  },
}
