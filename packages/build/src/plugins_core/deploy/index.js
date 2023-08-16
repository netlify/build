import { readFile } from 'fs/promises'

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
  packagePath,
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
  console.log(
    `>>> [deploy.corestep]
  `,
    {
      buildDir,
      configPath,
      packagePath,
      headersPath,
      redirectsPath,
      constants,
    },
  )

  try {
    const c = await readFile(configPath, 'utf-8')
    console.log('>> the toml to deploy', c)
  } catch {
    // noop
  }
  const client = createBuildbotClient(buildbotServerSocket)
  try {
    await connectBuildbotClient(client)
    await saveUpdatedConfig({
      configMutations,
      buildDir,
      packagePath,
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

export const shouldDeploy = function ({ buildbotServerSocket }) {
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
