'use strict'

const { saveUpdatedConfig, restoreUpdatedConfig } = require('../../core/config')
const { logDeploySuccess } = require('../../log/messages/plugins')

const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')

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

const deploySite = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'deploy_site',
  coreStepName: 'Deploy site',
  coreStepDescription: () => 'Deploy site',
  condition: shouldDeploy,
}

module.exports = { deploySite }
