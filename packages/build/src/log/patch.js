/* eslint-disable  no-unused-vars */
const util = require('util')

const chalk = require('chalk')

const { redactValues } = require('./redact')
const { serialize } = require('./serialize')

let previous = ''
function monkeyPatchLogs(secrets) {
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
          // const prefix = (pre && previous !== pre) ? `${chalk.bold(trim(pre))}:\n` : ''
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

function trim(string) {
  return string.replace(/^config\./, '')
}

module.exports.patchLogs = secrets => {
  return new Proxy(console.log, monkeyPatchLogs(secrets))
}

module.exports.setLogContext = pre => {
  process.env.LOG_CONTEXT = pre
}

module.exports.unsetLogContext = () => {
  process.env.LOG_CONTEXT = ''
}
