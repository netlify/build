const net = require('net')
const { promisify } = require('util')

const pEvent = require('p-event')

const { addErrorInfo } = require('../../error/info')

const BUILDBOT_CLIENT_TIMEOUT_PERIOD = 60 * 1000

const createBuildbotClient = function(buildbotServerSocket) {
  return net.createConnection(buildbotServerSocket)
}

const connectBuildbotClient = async function(client) {
  try {
    client.setTimeout(BUILDBOT_CLIENT_TIMEOUT_PERIOD, () => {
      client.end()
    })
    await pEvent(client, 'connect')
    return client
  } catch (error) {
    addErrorInfo(error, { type: 'buildbotClient' })
    throw error
  }
}

const closeBuildbotClient = async function(client) {
  try {
    await promisify(client.end.bind(client))()
  } catch (error) {
    addErrorInfo(error, { type: 'buildbotClient' })
    throw error
  }
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
  try {
    const [response] = await Promise.all([getNextParsedResponsePromise(client), writePayload(client, payload)])

    if (!response.succeeded) {
      throw new Error(`Deploy did not succeed: ${response.values.error}`)
    }
  } catch (error) {
    addErrorInfo(error, {
      type: 'buildbotClient',
      location: { payload },
    })
    throw error
  }

  return
}

module.exports = {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
}
