import { setEnvChanges } from '../env/changes.js'
import { addErrorInfo, isBuildError } from '../error/info.js'

import { updateNetlifyConfig, listConfigSideFiles } from './update_config.js'

// Fire a core step
export const fireCoreStep = async function ({
  coreStep,
  coreStepName,
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
    } = await coreStep({
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
      addErrorInfo(newError, { type: 'coreStep', location: { coreStepName } })
    }
    return { newError }
  }
}
