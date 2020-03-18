const {
  env: { LC_ALL },
} = require('process')

module.exports = {
  onInit() {
    console.log(LC_ALL)
  },
}
