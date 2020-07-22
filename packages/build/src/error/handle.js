const { logBuildError } = require('../log/main')
const { logOldCliVersionError } = require('../log/old_version')

const { removeErrorColors } = require('./colors')
const { reportBuildError } = require('./monitor/report')

// Logs and reports a build failure
const handleBuildError = async function(error, { errorMonitor, netlifyConfig, childEnv, mode, logs, testOpts }) {
  removeErrorColors(error)
  logBuildError({ error, netlifyConfig, mode, logs, testOpts })
  logOldCliVersionError({ mode, testOpts })
  await reportBuildError({ error, errorMonitor, childEnv, logs, testOpts })
}

module.exports = { handleBuildError }
