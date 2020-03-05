const { redactString } = require('./redact')

// This should be used instead of `console.log()`
const log = function(...args) {
  const string = args.map(redactString).join('\n')
  console.log(string)
}

module.exports = { log }
