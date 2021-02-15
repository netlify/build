'use strict'

const { promisify } = require('util')

const {
  loadPackageDefinition,
  credentials: { createInsecure: createCredentials },
} = require('@grpc/grpc-js')
const { load } = require('@grpc/proto-loader')

const { addErrorInfo } = require('../../error/info')
const { logDeploySuccess } = require('../../log/messages/plugins')
const { runsAfterDeploy } = require('../../plugins/events')

const SERVICE_PROTO = `${__dirname}/build_service.proto`

// Send a gRPC request to the buildbot to deploy the site
const grpcDeploy = async function ({ buildbotServerSocket, events, logs }) {
  const client = await startClient(buildbotServerSocket)
  try {
    await waitForReady(client)
    await runPostDeploy(client, events)
    logDeploySuccess(logs)
  } finally {
    client.close()
  }
}

// Start the gRPC client
const startClient = async function (buildbotServerSocket) {
  const serviceDefinition = await load(SERVICE_PROTO)
  const {
    buildservice: { BuildService },
  } = loadPackageDefinition(serviceDefinition)
  const origin = getOrigin(buildbotServerSocket)
  const client = new BuildService(origin, createCredentials())
  return client
}

const getOrigin = function (buildbotServerSocket) {
  if (buildbotServerSocket.includes(':')) {
    return buildbotServerSocket
  }

  return `unix:${buildbotServerSocket}`
}

// The server should already be up.
// Any timeout would indicate a bug in the buildbot.
const waitForReady = async function (client) {
  const deadline = Date.now() + CONNECT_TIMEOUT
  await promisify(client.waitForReady.bind(client))(deadline)
}

// Must be high enough due to https://github.com/grpc/grpc-node/blob/b570200827200c5a5764a5945a31d42c7b48c50b/packages/grpc-js/test/test-resolver.ts#L29
const CONNECT_TIMEOUT = 2e4

const runPostDeploy = async function (client, events) {
  const awaitLive = getAwaitLive(events)
  const { succeeded, errorMessage, errorType } = await promisify(client.RunPostDeploy.bind(client))({ awaitLive })
  if (!succeeded) {
    throw getDeployError(errorMessage, errorType)
  }
}

// We only wait for post-processing (last stage before site deploy) if the build
// has some plugins that do post-deploy logic
const getAwaitLive = function (events) {
  return events.some(hasPostDeployLogic)
}

const hasPostDeployLogic = function (event) {
  return runsAfterDeploy(event)
}

// We distinguish between user errors and system errors during deploys
const getDeployError = function (errorMessage, errorType) {
  const error = new Error(`Deploy did not succeed: ${errorMessage}`)
  const errorInfo =
    errorType === 'user'
      ? { type: 'resolveConfig' }
      : { type: 'coreCommand', location: { coreCommandName: 'Deploy site' } }
  addErrorInfo(error, errorInfo)
  return error
}

module.exports = { grpcDeploy }
