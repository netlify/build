const { inspect } = require('util')

const redactEnv = require('redact-env')
const replaceStream = require('replacestream')

const { hasColors } = require('./colors')

// Monkey patch console.log() to redact secrets
const startPatchingLog = function() {
  const redactedKeys = redactEnv.build(SECRETS)
  const originalConsoleLog = console.log
  console.log = patchLogs(redactedKeys)
  return { redactedKeys, originalConsoleLog }
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']

const stopPatchingLog = function(originalConsoleLog) {
  console.log = originalConsoleLog
}

const patchLogs = function(secrets) {
  return new Proxy(console.log, monkeyPatchLogs(secrets))
}

const monkeyPatchLogs = function(secrets) {
  // eslint-disable-next-line no-unused-vars
  let previous = ''
  return {
    apply(proxy, context, args) {
      if (!args.length) {
        return Reflect.apply(proxy, context, args)
      }
      let prefixSet = false
      const redactedArgs = args.map(arg => {
        const argA = typeof arg === 'string' ? arg : serialize(arg)
        const argB = redactEnv.redact(argA, secrets)

        if (!prefixSet) {
          prefixSet = true
          const pre = process.env.LOG_CONTEXT || ''
          // const prefix = (pre && previous !== pre) ? `${chalk.bold(pre.replace('config.', ''))}:\n` : ''
          const prefix = '' // disable prefix for now. Need to revisit
          previous = pre
          return `${prefix}${argB}`
        }

        return argB
      })
      return Reflect.apply(proxy, context, redactedArgs)
    }
  }
}

// Serialize non-strings for printing
const serialize = function(value) {
  return inspect(value, { depth: null, colors: hasColors(), compact: true })
}

const redactProcess = function(childProcess, redactedKeys) {
  childProcess.stdout.pipe(replaceStream(redactedKeys, '[secrets]')).pipe(process.stdout)
  childProcess.stderr.pipe(replaceStream(redactedKeys, '[secrets]')).pipe(process.stderr)
}

const setLogContext = function(pre) {
  process.env.LOG_CONTEXT = pre
}

const unsetLogContext = function() {
  process.env.LOG_CONTEXT = ''
}

module.exports = { startPatchingLog, stopPatchingLog, redactProcess, setLogContext, unsetLogContext }
