'use strict'

const { listConfigSideFiles } = require('@netlify/config')

const { setEnvChanges } = require('../env/changes')
const { addErrorInfo, isBuildError } = require('../error/info')

const { updateNetlifyConfig } = require('./update_config')

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
  configMutations,
  featureFlags,
  debug,
}) {
  try {
    const configSideFiles = await listConfigSideFiles(netlifyConfig, buildDir)
    const childEnvA = setEnvChanges(envChanges, { ...childEnv })
    const {
      newEnvChanges = {},
      configMutations: newConfigMutations = [],
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
    const { netlifyConfig: netlifyConfigA, configMutations: configMutationsA } = await updateNetlifyConfig({
      configOpts,
      netlifyConfig,
      buildDir,
      configMutations,
      newConfigMutations,
      configSideFiles,
      errorParams,
      logs,
      debug,
    })
    return { newEnvChanges, netlifyConfig: netlifyConfigA, configMutations: configMutationsA, tags }
  } catch (newError) {
    if (!isBuildError(newError)) {
      addErrorInfo(newError, { type: 'coreCommand', location: { coreCommandName } })
    }
    return { newError }
  }
}

module.exports = { fireCoreCommand }
