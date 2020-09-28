const net = require('net')
const { promisify } = require('util')

const pEvent = require('p-event')

const BUILDBOT_CLIENT_TIMEOUT_PERIOD = 60 * 1000

const createBuildbotClient = function(buildbotServerSocket) {
  const client = net.createConnection(buildbotServerSocket)
  client.setTimeout(BUILDBOT_CLIENT_TIMEOUT_PERIOD, () => {
    onBuildbotClientTimeout(client)
  })
  return client
}

const onBuildbotClientTimeout = function(client) {
  client.end()
  client.emit('error', `The TCP connection with the buildbot timed out after ${BUILDBOT_CLIENT_TIMEOUT_PERIOD}ms`)
}

const connectBuildbotClient = async function(client) {
  await pEvent(client, 'connect')
}

const closeBuildbotClient = async function(client) {
  if (client.destroyed) {
    return
  }

  await promisify(client.end.bind(client))()
}

const writePayload = async function(buildbotClient, payload) {
  await promisify(buildbotClient.write.bind(buildbotClient))(JSON.stringify(payload))
}

const getNextParsedResponsePromise = async function(buildbotClient) {
  const data = await pEvent(buildbotClient, 'data')
  return JSON.parse(data)
}

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
