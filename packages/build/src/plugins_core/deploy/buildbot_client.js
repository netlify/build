'use strict'

const net = require('net')
const { promisify } = require('util')

const pEvent = require('p-event')

const { runsAfterDeploy } = require('../../commands/get')
const { addAsyncErrorMessage } = require('../../utils/errors')

const createBuildbotClient = function (BUILDBOT_SERVER_SOCKET) {
  const connectionOpts = getConnectionOpts(BUILDBOT_SERVER_SOCKET)
  const client = net.createConnection(connectionOpts)
  return client
}

// Windows does not support Unix sockets well, so we also support `host:port`
const getConnectionOpts = function (BUILDBOT_SERVER_SOCKET) {
  if (!BUILDBOT_SERVER_SOCKET.includes(':')) {
    return { path: BUILDBOT_SERVER_SOCKET }
  }

  const [host, port] = BUILDBOT_SERVER_SOCKET.split(':')
  return { host, port }
}

const eConnectBuildbotClient = async function (client) {
  await pEvent(client, 'connect')
}

const connectBuildbotClient = addAsyncErrorMessage(eConnectBuildbotClient, 'Could not connect to buildbot')

const closeBuildbotClient = async function (client) {
  if (client.destroyed) {
    return
  }

  await promisify(client.end.bind(client))()
}

const cWritePayload = async function (buildbotClient, payload) {
  await promisify(buildbotClient.write.bind(buildbotClient))(JSON.stringify(payload))
}

const writePayload = addAsyncErrorMessage(cWritePayload, 'Could not send payload to buildbot')

const cGetNextParsedResponsePromise = async function (buildbotClient) {
  const data = await pEvent(buildbotClient, 'data')
  return JSON.parse(data)
}

const getNextParsedResponsePromise = addAsyncErrorMessage(
  cGetNextParsedResponsePromise,
  'Invalid response from buildbot',
)

const deploySiteWithBuildbotClient = async function ({ client, events, failBuild }) {
  const action = shouldWaitForPostProcessing(events) ? 'deploySiteAndAwaitLive' : 'deploySite'
  const payload = { action }

  const [{ succeeded, values: { error, error_type: errorType } = {} }] = await Promise.all([
    getNextParsedResponsePromise(client),
    writePayload(client, payload),
  ])

  if (!succeeded) {
    return handleDeployError({ error, errorType, failBuild })
  }
}

// We distinguish between user errors and system errors during deploys
const handleDeployError = function ({ error, errorType, failBuild }) {
  const errorMessage = `Deploy did not succeed: ${error}`

  if (errorType === 'user') {
    return failBuild(errorMessage)
  }

  throw new Error(errorMessage)
}

// We only wait for post-processing (last stage before site deploy) if the build
// has some plugins that do post-deploy logic
const shouldWaitForPostProcessing = function (events) {
  return events.some(hasPostDeployLogic)
}

const hasPostDeployLogic = function (event) {
  return runsAfterDeploy(event)
}

module.exports = {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
}
