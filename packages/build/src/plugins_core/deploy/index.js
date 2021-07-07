'use strict'

const { saveUpdatedConfig } = require('../../core/config')
const { logDeploySuccess } = require('../../log/messages/plugins')

const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')

const coreCommand = async function ({
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
  saveConfig,
}) {
  const client = createBuildbotClient(buildbotServerSocket)
  try {
    await connectBuildbotClient(client)
    await saveUpdatedConfig({
      configMutations,
      repositoryRoot,
      configPath,
      redirectsPath,
      context,
      branch,
      saveConfig,
    })
    await deploySiteWithBuildbotClient(client, events, constants)
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
