import { setEnvChanges } from '../env/changes.js'
import { addErrorInfo, isBuildError } from '../error/info.js'

import { updateNetlifyConfig, listConfigSideFiles } from './update_config.js'

// Fire a core step
export const fireCoreStep = async function ({
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
  configMutations,
  headersPath,
  redirectsPath,
  featureFlags,
  debug,
  systemLog,
  saveConfig,
  userNodeVersion,
  explicitSecretKeys,
  edgeFunctionsBootstrapURL,
  deployId,
}) {
  try {
    const configSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
    const childEnvA = setEnvChanges(envChanges, { ...childEnv })
    const {
      newEnvChanges = {},
      configMutations: newConfigMutations = [],
      tags,
      metrics,
    } = await coreStep({
      configPath,
      outputConfigPath,
      buildDir,
      repositoryRoot,
      constants,
      packagePath,
      buildbotServerSocket,
      events,
      logs,
      quiet,
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
      systemLog,
      saveConfig,
      userNodeVersion,
      explicitSecretKeys,
      edgeFunctionsBootstrapURL,
      deployId,
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
      source: 'coreStep',
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
