const { exit } = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  init() {
    console.log('test')
  },
}

setTimeout(() => {
  setTimeout(() => {
    exit()
  }, 0)
}, 0)
