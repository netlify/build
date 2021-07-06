'use strict'

const { setEnvChanges } = require('../env/changes')
const { addErrorInfo, isBuildError } = require('../error/info')

const { updateNetlifyConfig, listConfigSideFiles } = require('./update_config')

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
  redirectsPath,
  featureFlags,
  debug,
}) {
  try {
    const configSideFiles = await listConfigSideFiles(redirectsPath)
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
    const {
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      redirectsPath: redirectsPathA,
    } = await updateNetlifyConfig({
      configOpts,
      netlifyConfig,
      redirectsPath,
      configMutations,
      newConfigMutations,
      configSideFiles,
      errorParams,
      logs,
      debug,
    })
    return {
      newEnvChanges,
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      redirectsPath: redirectsPathA,
      tags,
    }
  } catch (newError) {
    if (!isBuildError(newError)) {
      addErrorInfo(newError, { type: 'coreCommand', location: { coreCommandName } })
    }
    return { newError }
  }
}

module.exports = { fireCoreCommand }
