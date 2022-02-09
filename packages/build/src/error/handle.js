import { cwd as getCwd } from 'process'

import { pathExists } from 'path-exists'

import { logBuildError } from '../log/messages/core.js'
import { logOldCliVersionError } from '../log/old_version.js'

import { removeErrorColors } from './colors.js'
import { getErrorInfo } from './info.js'
import { reportBuildError } from './monitor/report.js'
import { parseErrorInfo } from './parse/parse.js'

// Logs and reports a build failure
export const handleBuildError = async function (
  error,
  { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts },
) {
  const basicErrorInfo = parseErrorInfo(error)

  if (await isCancelCrash(error)) {
    return basicErrorInfo
  }

  removeErrorColors(error)
  // Some errors, such as telemetry ones, should not be logged
  if (basicErrorInfo.showInBuildLog) {
    logBuildError({ error, netlifyConfig, mode, logs, debug, testOpts })
  }
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
  const [{ type }] = getErrorInfo(error)
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
  } catch {
    return true
  }
}
