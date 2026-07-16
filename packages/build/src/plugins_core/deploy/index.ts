// eslint-disable-next-line n/no-missing-import
import { saveUpdatedConfig, restoreUpdatedConfig } from '../../core/config.js'
import { logDeploySuccess } from '../../log/messages/plugins.js'
import type { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'

import {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} from './buildbot_client.js'

const coreStep: CoreStepFunction = async function ({
  buildDir,
  configPath,
  deployEnvVars,
  repositoryRoot,
  constants,
  buildbotServerSocket,
  events,
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
  const client = createBuildbotClient(buildbotServerSocket!)
  try {
    // buildbot will emit logs. Flush the output to preserve the right order.
    logs?.outputFlusher?.flush()

    await connectBuildbotClient(client)
    await saveUpdatedConfig({
      configMutations,
      buildDir,
      repositoryRoot,
      configPath,
      headersPath,
      redirectsPath,
      logs,
      featureFlags,
      context,
      branch,
      debug,
      saveConfig,
    })
    await deploySiteWithBuildbotClient({
      client,
      environment: deployEnvVars,
      events,
      buildDir,
      repositoryRoot,
      constants,
    })
    await restoreUpdatedConfig({
      configMutations,
      buildDir,
      repositoryRoot,
      configPath,
      headersPath,
      redirectsPath,
      saveConfig,
    })
    logDeploySuccess(logs)
    return {}
  } finally {
    await closeBuildbotClient(client)
  }
}

export const shouldDeploy: CoreStepCondition = function ({ buildbotServerSocket }) {
  return buildbotServerSocket !== undefined
}

export const deploySite: CoreStep = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'deploy_site',
  coreStepName: 'Deploy site',
  coreStepDescription: () => 'Deploy site',
  condition: shouldDeploy,
}
