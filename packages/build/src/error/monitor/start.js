const { env } = require('process')

const Bugsnag = require('@bugsnag/js')
const memoizeOne = require('memoize-one')

const { name, version } = require('../../../package.json')
const { log } = require('../../log/logger.js')

const projectRoot = `${__dirname}/../../..`

// Start a client to monitor errors
const startErrorMonitor = function({ mode }) {
  const apiKey = env.BUGSNAG_KEY
  if (!apiKey) {
    return
  }

  const releaseStage = getReleaseStage(mode)
  try {
    const errorMonitor = startBugsnag({
      apiKey,
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
    log(`Error monitor could not start\n${error.stack}`)
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
const logger = { debug() {}, info() {}, warn: log, error: log }

module.exports = { startErrorMonitor }
