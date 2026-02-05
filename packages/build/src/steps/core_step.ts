import { setEnvChanges } from '../env/changes.js'
import { addErrorInfo, isBuildError } from '../error/info.js'
import { addOutputFlusher } from '../log/logger.js'

import { updateNetlifyConfig, listConfigSideFiles } from './update_config.js'

// Fire a core step
export const fireCoreStep = async function ({
  deployEnvVars,
  coreStep,
  coreStepId,
  coreStepName,
  configPath,
  outputConfigPath,
  buildDir,
  repositoryRoot,
  packagePath,
  constants,
  buildbotServerSocket,
  events,
  logs,
  quiet,
  nodePath,
  childEnv,
  context,
  branch,
  envChanges,
  errorParams,
  configOpts,
  netlifyConfig,
  defaultConfig,
  configMutations,
  headersPath,
  redirectsPath,
  featureFlags,
  debug,
  systemLog,
  saveConfig,
  userNodeVersion,
  explicitSecretKeys,
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
  deployId,
  outputFlusher,
  api,
  returnValues,
}) {
  const logsA = outputFlusher ? addOutputFlusher(logs, outputFlusher) : logs

  try {
    const configSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
    const childEnvA = setEnvChanges(envChanges, { ...childEnv })
    const {
      newEnvChanges = {},
      configMutations: newConfigMutations = [],
      tags,
      metrics,
    } = await coreStep({
      deployEnvVars,
      api,
      configPath,
      outputConfigPath,
      buildDir,
      repositoryRoot,
      constants,
      packagePath,
      buildbotServerSocket,
      events,
      logs: logsA,
      quiet,
      context,
      branch,
      childEnv: childEnvA,
      netlifyConfig,
      defaultConfig,
      nodePath,
      configMutations,
      headersPath,
      redirectsPath,
      featureFlags,
      debug,
      systemLog,
      saveConfig,
      userNodeVersion,
      explicitSecretKeys,
      enhancedSecretScan,
      edgeFunctionsBootstrapURL,
      deployId,
      returnValues,
    })
    const {
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      headersPath: headersPathA,
      redirectsPath: redirectsPathA,
    } = await updateNetlifyConfig({
      configOpts,
      netlifyConfig,
      defaultConfig,
      headersPath,
      redirectsPath,
      configMutations,
      newConfigMutations,
      configSideFiles,
      errorParams,
      logs: logsA,
      systemLog,
      debug,
    })
    return {
      newEnvChanges,
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      headersPath: headersPathA,
      redirectsPath: redirectsPathA,
      tags,
      metrics,
    }
  } catch (newError) {
    if (!isBuildError(newError)) {
      addErrorInfo(newError, { type: 'coreStep', location: { coreStepName } })
    }

    // always add the current stage
    addErrorInfo(newError, { stage: coreStepId })

    return { newError }
  }
}
