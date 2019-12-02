const { emitWarning } = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  init() {
    console.log('init')
  },
}

const emitWarn = function() {
  emitWarning('test')
}

emitWarn()
