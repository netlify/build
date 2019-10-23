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
  const argB = redactString(argA)
  return argB
}

const redactString = function(string) {
  return redactEnv.redact(string, secrets)
}

const redactProcess = function({ stdout, stderr, all }) {
  const stdoutA = stdout.pipe(replaceStream(secrets, '[secure]'))
  const stderrA = stderr.pipe(replaceStream(secrets, '[secure]'))
  const allA = all.pipe(replaceStream(secrets, '[secure]'))
  return { stdout: stdoutA, stderr: stderrA, all: allA }
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']
const secrets = redactEnv.build(SECRETS)

module.exports = { log, redactString, redactProcess }
