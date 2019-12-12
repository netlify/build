const { red } = require('chalk')

module.exports = {
  name: 'netlify-plugin-example',
  onInit() {
    console.log(red('onInit'))
  },
}
