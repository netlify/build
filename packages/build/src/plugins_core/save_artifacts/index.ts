import { saveUpdatedConfig } from '../../core/config.js'
import { shouldDeploy } from '../deploy/index.js'
import type { CoreStep, CoreStepCondition, CoreStepFunctionArgs } from '../types.js'

const coreStep = async function ({
  buildDir,
  configPath,
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
}: CoreStepFunctionArgs & { outputConfigPath?: string | undefined }) {
  await saveUpdatedConfig({
    configMutations,
    buildDir,
    repositoryRoot,
    configPath,
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
const shouldSaveArtifacts: CoreStepCondition = (options) => {
  // Programmatic callers may omit `saveConfig`
  const flags: { saveConfig?: boolean | undefined } = options
  return !shouldDeploy(options) && flags.saveConfig === true
}

export const saveArtifacts: CoreStep = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'save_artifacts',
  coreStepName: 'Save deploy artifacts',
  coreStepDescription: () => 'Save deploy artifacts',
  condition: shouldSaveArtifacts,
}
