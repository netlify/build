'use strict'

const { saveUpdatedConfig, restoreUpdatedConfig } = require('../../core/config')
const { logDeploySuccess } = require('../../log/messages/plugins')

const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')

const coreCommand = async function ({
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
      redirectsPath,
      logs,
      context,
      branch,
      debug,
      saveConfig,
    })
    await deploySiteWithBuildbotClient(client, events, constants)
    await restoreUpdatedConfig({
      buildDir,
      repositoryRoot,
      configPath,
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
  coreCommand,
  coreCommandId: 'deploy_site',
  coreCommandName: 'Deploy site',
  coreCommandDescription: () => 'Deploy site',
  condition: shouldDeploy,
}

module.exports = { deploySite }
