import { type Logs, log } from '../logger.js'

const logVerbose = function (logs: Logs | undefined, verbose: boolean, message: string) {
  if (!verbose) {
    return
  }

  log(logs, message)
}

export const logSendingEventToChild = function (logs: Logs | undefined, verbose: boolean) {
  logVerbose(logs, verbose, 'Step starting.')
}

export const logSentEventToChild = function (logs: Logs | undefined, verbose: boolean) {
  logVerbose(logs, verbose, 'Step started.')
}

export const logPluginMethodStart = function (verbose: boolean) {
  logVerbose(undefined, verbose, 'Plugin logic started.')
}

export const logPluginMethodEnd = function (verbose: boolean) {
  logVerbose(undefined, verbose, 'Plugin logic ended.')
}

export const logSendingEventToParent = function (verbose: boolean, error: unknown) {
  const message = error instanceof Error ? `Step erroring.\n${String(error.stack)}` : 'Stop closing.'
  logVerbose(undefined, verbose, message)
}

export const logReceivedEventFromChild = function (logs: Logs | undefined, verbose: boolean) {
  logVerbose(logs, verbose, 'Step ended.')
}

export const logStepCompleted = function (logs: Logs | undefined, verbose: boolean) {
  logVerbose(logs, verbose, 'Step completed.')
}
