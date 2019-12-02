const { exit } = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  init() {
    console.log('test')
  },
}

setTimeout(exit)
