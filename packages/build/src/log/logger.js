const { inspect } = require('util')

const { redactString } = require('./redact')

// This should be used instead of `console.log()` in order to:
//  - serialize objects
//  - redact secrets
const log = function(...args) {
  const string = args.map(arg => serializeArg(arg)).join('\n')
  console.log(string)
}

const serializeArg = function(arg) {
  const argA = typeof arg === 'string' ? arg : inspect(arg, { depth: Infinity })
  const argB = redactString(argA)
  return argB
}

module.exports = { log }
