'use strict'

const { log } = require('../logger')

const logVerbose = function (logs, verbose, message) {
  if (!verbose) {
    return
  }

  log(logs, message)
}

const logSendingEventToChild = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step starting.')
}

const logSentEventToChild = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step started.')
}

const logPluginMethodStart = function (verbose) {
  logVerbose(undefined, verbose, 'Plugin logic started.')
}

const logPluginMethodEnd = function (verbose) {
  logVerbose(undefined, verbose, 'Plugin logic ended.')
}

const logSendingEventToParent = function (verbose, error) {
  const message = error instanceof Error ? `Step erroring.\n${error.stack}` : 'Stop closing.'
  logVerbose(undefined, verbose, message)
}

const logReceivedEventFromChild = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step ended.')
}

const logStepCompleted = function (logs, verbose) {
  logVerbose(logs, verbose, 'Step completed.')
}

module.exports = {
  logSendingEventToChild,
  logSentEventToChild,
  logPluginMethodStart,
  logPluginMethodEnd,
  logSendingEventToParent,
  logReceivedEventFromChild,
  logStepCompleted,
}
