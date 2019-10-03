const { getSecrets, redactValues } = require('./redact')
const { serialize } = require('./serialize')

// Monkey patch console.log() to redact secrets
const startPatchingLog = function() {
  const redactedKeys = getSecrets(SECRETS)
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
      const redactedArgs = args.map(a => {
        const redactedLog = redactValues(a, secrets)
        if (typeof a === 'object') {
          return serialize(redactedLog)
        }
        if (!prefixSet) {
          prefixSet = true
          const pre = process.env.LOG_CONTEXT || ''
          // const prefix = (pre && previous !== pre) ? `${chalk.bold(pre.replace('config.', ''))}:\n` : ''
          const prefix = '' // disable prefix for now. Need to revisit
          previous = pre
          return `${prefix}${redactedLog}`
        }
        return redactedLog
      })
      return Reflect.apply(proxy, context, redactedArgs)
    }
  }
}

const setLogContext = function(pre) {
  process.env.LOG_CONTEXT = pre
}

const unsetLogContext = function() {
  process.env.LOG_CONTEXT = ''
}

module.exports = { startPatchingLog, stopPatchingLog, setLogContext, unsetLogContext }
