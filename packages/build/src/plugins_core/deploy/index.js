'use strict'

const { logDeploySuccess } = require('../../log/messages/plugins')

const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')
const { grpcDeploy } = require('./grpc_deploy.js')

const coreCommand = async function ({ buildbotServerSocket, events, logs, featureFlags }) {
  if (featureFlags.grpc) {
    return await grpcDeploy({ buildbotServerSocket, events, logs })
  }

  return await jsonCommand({ buildbotServerSocket, events, logs })
}

const jsonCommand = async function ({ buildbotServerSocket, events, logs }) {
  const client = createBuildbotClient(buildbotServerSocket)
  try {
    await connectBuildbotClient(client)
    await deploySiteWithBuildbotClient(client, events)
    logDeploySuccess(logs)
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
  condition: shouldDeploy,
}

module.exports = { deploySite }
