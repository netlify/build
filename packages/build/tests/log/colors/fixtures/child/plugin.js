const { red } = require('chalk')

module.exports = {
  onInit() {
    console.log(red('onInit'))
  },
}
