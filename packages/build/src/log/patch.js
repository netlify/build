const { inspect } = require('util')

const redactEnv = require('redact-env')
const replaceStream = require('replacestream')

// This should be used instead of `console.log()` in order to:
//  - serialize objects
//  - redact secrets
const log = function(...args) {
  const state = { prefixSet: false }
  const string = args.map(arg => serializeArg(arg, state)).join(' ')
  console.log(string)
}

const serializeArg = function(arg, state) {
  const argA = typeof arg === 'string' ? arg : inspect(arg, { depth: Infinity })
  const argB = redactEnv.redact(argA, secrets)
  return argB
}

const redactProcess = function(childProcess) {
  childProcess.stdout.pipe(replaceStream(secrets, '[secrets]')).pipe(process.stdout)
  childProcess.stderr.pipe(replaceStream(secrets, '[secrets]')).pipe(process.stderr)
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']
const secrets = redactEnv.build(SECRETS)

module.exports = { log, redactProcess }
