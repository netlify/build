'use strict'

const { runsOnlyOnBuildFailure } = require('../plugins/events')

// The last event handler of a plugin (except for `onError` and `onEnd`)
// defaults to `utils.status.show({ state: 'success' })` without any `summary`.
const getSuccessStatus = function (newStatus, { commands, event, packageName }) {
  if (newStatus === undefined && isLastNonErrorCommand({ commands, event, packageName })) {
    return IMPLICIT_STATUS
  }

  return newStatus
}

const isLastNonErrorCommand = function ({ commands, event, packageName }) {
  const nonErrorCommands = commands.filter(
    (command) => command.packageName === packageName && !runsOnlyOnBuildFailure(command.event),
  )
  return nonErrorCommands.length === 0 || nonErrorCommands[nonErrorCommands.length - 1].event === event
}

const IMPLICIT_STATUS = { state: 'success', implicit: true }

module.exports = { getSuccessStatus }
