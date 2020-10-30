'use strict'

const { cwd: getCwd } = require('process')

const pathExists = require('path-exists')

const { logBuildError } = require('../log/messages/core')
const { logOldCliVersionError } = require('../log/old_version')

const { removeErrorColors } = require('./colors')
const { getErrorInfo } = require('./info')
const { reportBuildError } = require('./monitor/report')
const { parseErrorInfo } = require('./parse/parse')

// Logs and reports a build failure
const handleBuildError = async function (
  error,
  { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts },
) {
  const basicErrorInfo = parseErrorInfo(error)

  if (await isCancelCrash(error)) {
    return basicErrorInfo
  }

  removeErrorColors(error)
  logBuildError({ error, netlifyConfig, mode, logs, debug, testOpts })
  logOldCliVersionError({ mode, testOpts })
  await reportBuildError({ error, errorMonitor, childEnv, logs, testOpts })

  return basicErrorInfo
}

// When builds are canceled, the whole filesystem is being deleted.
// However, the process (and build) keeps going. Because no files exist anymore,
// the build eventually crashes with a randomly odd error. Those should not be
// logged nor reported.
// However builds canceled with `utils.build.cancelBuild()` should still show
// "Build canceled by ..."
const isCancelCrash = async function (error) {
  const { type } = getErrorInfo(error)
  if (type === 'cancelBuild') {
    return false
  }

  try {
    // TODO: find a better way to detect that the build is being cancelled.
    // Otherwise bugs due to (for example) the build command removing
    // `process.cwd` are currently not logged/reported.
    const cwd = getCwd()
    return !(await pathExists(cwd))
    // `process.cwd()` fails when the current directory does not exist
  } catch (error_) {
    return true
  }
}

module.exports = { handleBuildError }
