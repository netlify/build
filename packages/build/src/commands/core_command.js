'use strict'

const { setEnvChanges } = require('../env/changes')
const { addErrorInfo, isBuildError } = require('../error/info')

// Fire a core command
const fireCoreCommand = async function ({
  coreCommand,
  coreCommandName,
  configPath,
  buildDir,
  constants,
  buildbotServerSocket,
  events,
  logs,
  nodePath,
  childEnv,
  envChanges,
  netlifyConfig,
  featureFlags,
}) {
  try {
    const childEnvA = setEnvChanges(envChanges, { ...childEnv })
    return await coreCommand({
      configPath,
      buildDir,
      constants,
      buildbotServerSocket,
      events,
      logs,
      childEnv: childEnvA,
      netlifyConfig,
      nodePath,
      featureFlags,
    })
  } catch (newError) {
    if (!isBuildError(newError)) {
      addErrorInfo(newError, { type: 'coreCommand', location: { coreCommandName } })
    }
    return { newError }
  }
}

module.exports = { fireCoreCommand }
