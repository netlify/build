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
  repositoryRoot,
  constants,
  buildbotServerSocket,
  events,
  logs,
  nodePath,
  childEnv,
  context,
  branch,
  envChanges,
  errorParams,
  configOpts,
  netlifyConfig,
  configMutations,
  headersPath,
  redirectsPath,
  featureFlags,
  debug,
  saveConfig,
}) {
  try {
    const configSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
    const childEnvA = setEnvChanges(envChanges, { ...childEnv })
    const {
      newEnvChanges = {},
      configMutations: newConfigMutations = [],
      tags,
    } = await coreCommand({
      configPath,
      buildDir,
      repositoryRoot,
      constants,
      buildbotServerSocket,
      events,
      logs,
      context,
      branch,
      childEnv: childEnvA,
      netlifyConfig,
      nodePath,
      configMutations,
      headersPath,
      redirectsPath,
      featureFlags,
      debug,
      saveConfig,
    })
    const {
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      headersPath: headersPathA,
      redirectsPath: redirectsPathA,
    } = await updateNetlifyConfig({
      configOpts,
      netlifyConfig,
      headersPath,
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
      headersPath: headersPathA,
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
