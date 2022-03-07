import { log } from '../logger.js'

const logVerbose = function (logs, verbose, message) {
  if (!verbose) {
    return
  }

  log(logs, message)
}

export const logSendingEventToChild = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step starting.')
}

export const logSentEventToChild = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step started.')
}

export const logPluginMethodStart = function (verbose) {
  logVerbose(undefined, verbose, 'Plugin logic started.')
}

export const logPluginMethodEnd = function (verbose) {
  logVerbose(undefined, verbose, 'Plugin logic ended.')
}

export const logSendingEventToParent = function (verbose, error) {
  const message = error instanceof Error ? `Step erroring.\n${error.stack}` : 'Stop closing.'
  logVerbose(undefined, verbose, message)
}

export const logReceivedEventFromChild = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step ended.')
}

export const logStepCompleted = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step completed.')
}
