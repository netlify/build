const { hrtime } = require('process')

const { tick } = require('figures')
const chalk = require('chalk')

// Start a timer
const startTimer = function() {
  return hrtime()
}

// End a timer and prints the result on console
const endTimer = function({ context, hook }, [startSecs, startNsecs]) {
  const [endSecs, endNsecs] = hrtime()
  const durationNs = (endSecs - startSecs) * NANOSECS_TO_SECS + (endNsecs - startNsecs)
  const durationMs = Math.ceil(durationNs / NANOSECS_TO_MSECS)
  const hookLog = (hook) ? `.${chalk.bold(hook)}` : ''
  const contextLog = (context.match(/^build.lifecycle/)) ? 'build.lifecycle' : context
  console.info(`${chalk.green(tick)}  ${chalk.green.bold(contextLog)}${hookLog} completed in ${durationMs}ms`)
}

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MSECS = 1e6

module.exports = { startTimer, endTimer }
