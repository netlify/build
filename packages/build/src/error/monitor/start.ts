import { fileURLToPath } from 'url'

import Bugsnag from '@bugsnag/js'
import memoizeOne from 'memoize-one'

import type { ResolvedFlags } from '../../core/normalize_flags.js'
import { type Logs, getSystemLogger, log } from '../../log/logger.js'
import { ROOT_PACKAGE_JSON } from '../../utils/json.js'
import type { SystemLogger } from '../../plugins_core/types.js'

const projectRoot = fileURLToPath(new URL('../../..', import.meta.url))

// Start a client to monitor errors
export const startErrorMonitor = function (config: { flags: ResolvedFlags; logs?: Logs; bugsnagKey?: string }) {
  const {
    flags: { debug, mode, systemLogFile },
    logs,
    bugsnagKey,
  } = config

  if (!bugsnagKey) {
    return
  }

  const isTest = isBugsnagTest(bugsnagKey)
  const releaseStage = getReleaseStage(mode)
  const logger = getLogger(getSystemLogger(logs, debug, systemLogFile), isTest)
  try {
    const errorMonitor = startBugsnag({
      apiKey: 'aabbccddaabbccddaabbccddaabbccdd',
      appVersion: `${ROOT_PACKAGE_JSON.name} ${ROOT_PACKAGE_JSON.version}`,
      appType: ROOT_PACKAGE_JSON.name,
      releaseStage,
      logger,
      projectRoot,
      endpoints: {
        notify: 'http://dry-run:9999/notify', // nothing listening → fast failure
        sessions: 'http://dry-run:9999/sessions',
      },
    })

    // Allows knowing the percentage of failed builds per release
    if (!isTest) {
      errorMonitor.startSession()
    }

    errorMonitor.notify(new Error('just testing stuff'))

    return errorMonitor
    // Failsafe
  } catch (error) {
    log(logs, `Error monitor could not start\n${error.stack}`)
  }
}

const isBugsnagTest = function (bugsnagKey) {
  return bugsnagKey === BUGSNAG_TEST_KEY
}

const BUGSNAG_TEST_KEY = '00000000000000000000000000000000'

// Bugsnag.start() caches a global instance and warns on duplicate calls.
// This ensures the warning message is not shown when calling the main function
// several times.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const startBugsnag = memoizeOne(Bugsnag.start.bind(Bugsnag), () => true) as typeof Bugsnag.default.start

// Based the release stage on the `mode`
const getReleaseStage = function (mode = DEFAULT_RELEASE_STAGE) {
  return mode
}

const DEFAULT_RELEASE_STAGE = 'unknown'

// We don't want Bugsnag logs except on warnings/errors.
// We also want to use our own `log` utility, unprefixed.
// In tests, we don't print Bugsnag because it sometimes randomly fails to
// send sessions, which prints warning messags in test snapshots.
const getLogger = function (systemLogger: SystemLogger, isTest) {
  const logFunc = isTest ? noop : log.bind(null, systemLogger)
  return { debug: noop, info: noop, warn: logFunc, error: logFunc } satisfies Bugsnag.Logger
}

const noop = function () {
  // this is a noop function
}
