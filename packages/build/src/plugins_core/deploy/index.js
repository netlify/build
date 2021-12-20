import { saveUpdatedConfig, restoreUpdatedConfig } from '../../core/config.js'
import { logDeploySuccess } from '../../log/messages/plugins.js'

import {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} from './buildbot_client.js'

const coreStep = async function ({
  buildDir,
  configPath,
  repositoryRoot,
  constants,
  buildbotServerSocket,
  events,
  logs,
  context,
  branch,
  configMutations,
  headersPath,
  redirectsPath,
  debug,
  saveConfig,
}) {
  const client = createBuildbotClient(buildbotServerSocket)
  try {
    await connectBuildbotClient(client)
    await saveUpdatedConfig({
      configMutations,
      buildDir,
      repositoryRoot,
      configPath,
      headersPath,
      redirectsPath,
      logs,
      context,
      branch,
      debug,
      saveConfig,
    })
    await deploySiteWithBuildbotClient({ client, events, buildDir, repositoryRoot, constants })
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

const shouldDeploy = function ({ buildbotServerSocket }) {
  return buildbotServerSocket !== undefined
}

export const deploySite = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'deploy_site',
  coreStepName: 'Deploy site',
  coreStepDescription: () => 'Deploy site',
  condition: shouldDeploy,
}
