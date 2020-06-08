const Bugsnag = require('@bugsnag/js')
const memoizeOne = require('memoize-one')

const { name, version } = require('../../../package.json')
const { log } = require('../../log/logger.js')

const projectRoot = `${__dirname}/../../..`

// Start a client to monitor errors
const startErrorMonitor = function({ flags: { mode }, logs, bugsnagKey }) {
  if (!bugsnagKey) {
    return
  }

  const releaseStage = getReleaseStage(mode)
  const logger = getLogger(logs)
  try {
    const errorMonitor = startBugsnag({
      apiKey: bugsnagKey,
      appVersion: `${name} ${version}`,
      appType: name,
      releaseStage,
      logger,
      projectRoot,
    })

    // Allows knowing the percentage of failed builds per release
    errorMonitor.startSession()

    return errorMonitor
    // Failsafe
  } catch (error) {
    log(logs, `Error monitor could not start\n${error.stack}`)
    return
  }
}

// Bugsnag.start() caches a global instance and warns on duplicate calls.
// This ensures the warning message is not shown when calling the main function
// several times.
const startBugsnag = memoizeOne(Bugsnag.start.bind(Bugsnag), () => true)

// Based the release stage on the `mode`
const getReleaseStage = function(mode = DEFAULT_RELEASE_STAGE) {
  return mode
}

const DEFAULT_RELEASE_STAGE = 'unknown'

// We don't want Bugsnag logs except on warnings/errors.
// We also want to use our own `log` utility, unprefixed.
const getLogger = function(logs) {
  const logFunc = log.bind(null, logs)
  return { debug() {}, info() {}, warn: logFunc, error: logFunc }
}

module.exports = { startErrorMonitor }
