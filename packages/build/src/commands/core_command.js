'use strict'

const { addErrorInfo, isBuildError } = require('../error/info')

// Fire a core command
const fireCoreCommand = async function ({
  coreCommand,
  coreCommandName,
  buildDir,
  constants,
  buildbotServerSocket,
  events,
  logs,
  childEnv,
  featureFlags,
  netlifyConfig,
}) {
  try {
    const commandResult = await coreCommand({
      buildDir,
      constants,
      buildbotServerSocket,
      events,
      logs,
      childEnv,
      featureFlags,
      netlifyConfig,
    })

    return commandResult || {}
  } catch (newError) {
    if (!isBuildError(newError)) {
      addErrorInfo(newError, { type: 'coreCommand', location: { coreCommandName } })
    }
    return { newError }
  }
}

module.exports = { fireCoreCommand }
