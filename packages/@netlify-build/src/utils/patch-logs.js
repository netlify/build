const util = require('util')

const chalk = require('chalk')

const { redactValues } = require('./redact')

function monkeyPatchLogs(secrets) {
  return {
    apply(target, ctx, args) {
      if (!args.length) {
        return Reflect.apply(...arguments)
      }
      // console.warn('arguments', args)
      // update ARGS
      const isTimer = args && args[0] && args[0] === '%s: %sms'
      if (isTimer) {
        const timing = args.map((a, i) => {
          if (i === 0) {
            return '%s %sms'
          }
          if (i === 1) {
            const check = chalk.green('✔')
            const msg = chalk.yellowBright(`${trim(a)}`)
            return `${check} ${msg} completed in`
          }
          return a
        })
        arguments['2'] = timing
        return Reflect.apply(...arguments)
      }
      let prefixSet = false

      arguments['2'] = args.map(a => {
        const redactedLog = redactValues(a, secrets)
        if (typeof a === 'object') {
          return util.inspect(redactedLog, {
            showHidden: false,
            depth: null,
            colors: true
          })
        }
        if (!prefixSet) {
          prefixSet = true
          const pre = process.env.LOG_CONTEXT || ''
          const prefix = pre ? `${chalk.bold(trim(pre))}: ` : ''
          return `${prefix}${redactedLog}`
        }
        return redactedLog
      })
      return Reflect.apply(...arguments)
    }
  }
}

function trim(string) {
  return string.replace(/^config\./, '')
}

module.exports.patch = secrets => {
  return new Proxy(console.log, monkeyPatchLogs(secrets))
}

module.exports.setContext = pre => {
  process.env.LOG_CONTEXT = pre
}

module.exports.reset = () => {
  process.env.LOG_CONTEXT = ''
}
