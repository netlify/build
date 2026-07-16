import { saveUpdatedConfig } from '../../core/config.js'
// eslint-disable-next-line n/no-missing-import
import { shouldDeploy } from '../deploy/index.js'

const coreStep = async function ({
  buildDir,
  configPath,
  packagePath,
  outputConfigPath,
  repositoryRoot,
  logs,
  featureFlags,
  context,
  branch,
  configMutations,
  headersPath,
  redirectsPath,
  debug,
  saveConfig,
}) {
  await saveUpdatedConfig({
    configMutations,
    buildDir,
    repositoryRoot,
    configPath,
    packagePath,
    outputConfigPath,
    headersPath,
    redirectsPath,
    logs,
    featureFlags,
    context,
    branch,
    debug,
    saveConfig,
  })

  return {}
}

// This step and the deploy step must be mutually exclusive, or we end up
// mutating the config twice.
const shouldSaveArtifacts = (options) => {
  return !shouldDeploy(options) && options.saveConfig === true
}

export const saveArtifacts = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'save_artifacts',
  coreStepName: 'Save deploy artifacts',
  coreStepDescription: () => 'Save deploy artifacts',
  condition: shouldSaveArtifacts,
}
