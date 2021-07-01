'use strict'

const { setEnvChanges } = require('../env/changes')
const { addErrorInfo, isBuildError } = require('../error/info')

const { listConfigSideFiles, updateNetlifyConfig } = require('./update_config')

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
  errorParams,
  configOpts,
  netlifyConfig,
  priorityConfig,
  context,
  branch,
  featureFlags,
  debug,
}) {
  try {
    const configSideFiles = await listConfigSideFiles(netlifyConfig, buildDir)
    const childEnvA = setEnvChanges(envChanges, { ...childEnv })
    const {
      newEnvChanges = {},
      configMutations = [],
      tags,
    } = await coreCommand({
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
    const { netlifyConfig: netlifyConfigA, priorityConfig: priorityConfigA } = await updateNetlifyConfig({
      configOpts,
      priorityConfig,
      netlifyConfig,
      context,
      branch,
      buildDir,
      configMutations,
      configSideFiles,
      errorParams,
      logs,
      debug,
    })
    return { newEnvChanges, netlifyConfig: netlifyConfigA, priorityConfig: priorityConfigA, tags }
  } catch (newError) {
    if (!isBuildError(newError)) {
      addErrorInfo(newError, { type: 'coreCommand', location: { coreCommandName } })
    }
    return { newError }
  }
}

module.exports = { fireCoreCommand }
