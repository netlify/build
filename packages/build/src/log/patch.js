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
  const argB = addContext(argA, state)
  const argC = redactEnv.redact(argB, secrets)
  return argC
}

// eslint-disable-next-line no-unused-vars
let previous = ''

const redactProcess = function(childProcess) {
  childProcess.stdout.pipe(replaceStream(secrets, '[secrets]')).pipe(process.stdout)
  childProcess.stderr.pipe(replaceStream(secrets, '[secrets]')).pipe(process.stderr)
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']
const secrets = redactEnv.build(SECRETS)

const addContext = function(arg, state) {
  if (state.prefixSet) {
    return arg
  }

  state.prefixSet = true
  const pre = process.env.LOG_CONTEXT || ''
  // const prefix = (pre && previous !== pre) ? `${chalk.bold(pre.replace('config.', ''))}:\n` : ''
  const prefix = '' // disable prefix for now. Need to revisit
  previous = pre
  return `${prefix}${arg}`
}

const setLogContext = function(pre) {
  process.env.LOG_CONTEXT = pre
}

const unsetLogContext = function() {
  process.env.LOG_CONTEXT = ''
}

module.exports = { log, redactProcess, setLogContext, unsetLogContext }
