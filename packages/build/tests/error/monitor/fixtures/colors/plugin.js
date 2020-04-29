const { red } = require('chalk')

module.exports = {
  onInit() {
    throw new Error(red('ColorTest'))
  },
}
