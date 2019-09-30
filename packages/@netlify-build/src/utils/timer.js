const { hrtime } = require('process')

const { tick } = require('figures')
const chalk = require('chalk')

// Start a timer
const startTimer = function() {
  return hrtime()
}

// End a timer and prints the result on console
const endTimer = function(name, [startSecs, startNsecs]) {
  const [endSecs, endNsecs] = hrtime()
  const durationNs = (endSecs - startSecs) * NANOSECS_TO_SECS + (endNsecs - startNsecs)
  const durationMs = Math.ceil(durationNs / NANOSECS_TO_MSECS)
  console.info(`${chalk.green(tick)} ${chalk.yellowBright(name)} completed in ${durationMs}ms`)
}

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MSECS = 1e6

module.exports = { startTimer, endTimer }
