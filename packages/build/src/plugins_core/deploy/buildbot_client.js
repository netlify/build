const net = require('net')
const { promisify } = require('util')

const pEvent = require('p-event')

const { addAsyncErrorMessage } = require('../../utils/errors')

const createBuildbotClient = function({ BUILDBOT_SERVER_SOCKET, BUILDBOT_SERVER_SOCKET_TIMEOUT }) {
  const connectionOpts = getConnectionOpts(BUILDBOT_SERVER_SOCKET)
  const client = net.createConnection(connectionOpts)
  client.setTimeout(BUILDBOT_SERVER_SOCKET_TIMEOUT, () => {
    onBuildbotClientTimeout({ client, BUILDBOT_SERVER_SOCKET_TIMEOUT })
  })
  return client
}

// Windows does not support Unix sockets well, so we also support `host:port`
const getConnectionOpts = function(BUILDBOT_SERVER_SOCKET) {
  if (!BUILDBOT_SERVER_SOCKET.includes(':')) {
    return { path: BUILDBOT_SERVER_SOCKET }
  }

  const [host, port] = BUILDBOT_SERVER_SOCKET.split(':')
  return { host, port }
}

const onBuildbotClientTimeout = function({ client, BUILDBOT_SERVER_SOCKET_TIMEOUT }) {
  client.destroy(new Error(`The TCP connection with the buildbot timed out after ${BUILDBOT_SERVER_SOCKET_TIMEOUT}ms`))
}

const eConnectBuildbotClient = async function(client) {
  await pEvent(client, 'connect')
}

const connectBuildbotClient = addAsyncErrorMessage(eConnectBuildbotClient, 'Could not connect to buildbot')

const closeBuildbotClient = async function(client) {
  if (client.destroyed) {
    return
  }

  await promisify(client.end.bind(client))()
}

const cWritePayload = async function(buildbotClient, payload) {
  await promisify(buildbotClient.write.bind(buildbotClient))(JSON.stringify(payload))
}

const writePayload = addAsyncErrorMessage(cWritePayload, 'Could not send payload to buildbot')

const cGetNextParsedResponsePromise = async function(buildbotClient) {
  const data = await pEvent(buildbotClient, 'data')
  return JSON.parse(data)
}

const getNextParsedResponsePromise = addAsyncErrorMessage(
  cGetNextParsedResponsePromise,
  'Invalid response from buildbot',
)

const deploySiteWithBuildbotClient = async function(client) {
  const payload = { action: 'deploySite' }
  const [response] = await Promise.all([getNextParsedResponsePromise(client), writePayload(client, payload)])

  if (!response.succeeded) {
    throw new Error(`Deploy did not succeed: ${response.values.error}`)
  }
}

module.exports = {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
}
