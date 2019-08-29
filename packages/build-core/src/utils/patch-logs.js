const chalk = require('chalk')
const util = require('util')
/*
  Monkey patch logs for structured logging
 */

const monkeyPatchLogFunc = {
  apply (target, ctx, args) {
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
    arguments['2'] = args.map((a) => {
      if (typeof a === 'object') {
        return util.inspect(a, { showHidden: false, depth: null, colors: true })
      }
      if (!prefixSet) {
        prefixSet = true
        const pre = process.env.LOG_CONTEXT || ''
        const prefix = (pre) ? `${chalk.dim(trim(pre))}: ` : ''
        return `${prefix}${a}`
      }
      return `${a}`
    })
    return Reflect.apply(...arguments)
  }
}

function trim(string) {
  return string.replace(/^config\./, '')
}

module.exports.patch = new Proxy(console.log, monkeyPatchLogFunc)

module.exports.setContext = (pre) => {
  process.env.LOG_CONTEXT = pre
}

module.exports.reset = () => {
  process.env.LOG_CONTEXT = ''
}
