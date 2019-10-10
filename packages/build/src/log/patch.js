const { inspect } = require('util')

const redactEnv = require('redact-env')
const replaceStream = require('replacestream')

// Monkey patch console.log() to redact secrets
const startPatchingLog = function() {
  const originalConsoleLog = console.log
  console.log = new Proxy(console.log, monkeyPatchLogs())
  return originalConsoleLog
}

const stopPatchingLog = function(originalConsoleLog) {
  console.log = originalConsoleLog
}

const monkeyPatchLogs = function() {
  const secrets = redactEnv.build(SECRETS)
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
  return inspect(value, { depth: Infinity })
}

const redactProcess = function(childProcess) {
  const secrets = redactEnv.build(SECRETS)
  childProcess.stdout.pipe(replaceStream(secrets, '[secrets]')).pipe(process.stdout)
  childProcess.stderr.pipe(replaceStream(secrets, '[secrets]')).pipe(process.stderr)
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']

const setLogContext = function(pre) {
  process.env.LOG_CONTEXT = pre
}

const unsetLogContext = function() {
  process.env.LOG_CONTEXT = ''
}

module.exports = { startPatchingLog, stopPatchingLog, redactProcess, setLogContext, unsetLogContext }
