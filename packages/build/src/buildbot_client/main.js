const net = require('net')
const { promisify } = require('util')

const pEvent = require('p-event')

const { addErrorInfo } = require('../error/info')

const startBuildbotClient = async function(buildbotServerSocket) {
  if (buildbotServerSocket === undefined) {
    return
  }
  try {
    const buildbotClient = net.createConnection(buildbotServerSocket)
    await pEvent(buildbotClient, 'connect')
    return buildbotClient
  } catch (error) {
    addErrorInfo(error, { type: 'buildbotClientConnection' })
    throw error
  }
}

const closeBuildbotClient = async function(buildbotClient) {
  if (buildbotClient === undefined) {
    return
  }
  try {
    await promisify(buildbotClient.end.bind(buildbotClient))()
  } catch (error) {
    addErrorInfo(error, { type: 'buildbotClientConnection' })
    throw error
  }
}

const writePayload = async function(buildbotClient, payload) {
  if (buildbotClient === undefined) {
    return
  }
  try {
    await promisify(buildbotClient.write.bind(buildbotClient))(JSON.stringify(payload))
  } catch (e) {
    const error = new Error(`Error writing TCP payload to buildbot: ${e.message}`)
    addErrorInfo(error, { type: 'buildbotClient ' })
    throw error
  }
}

const getNextParsedResponsePromise = async function(buildbotClient) {
  if (buildbotClient === undefined) {
    return
  }
  const data = await pEvent(buildbotClient, 'data')
  try {
    return JSON.parse(data)
  } catch (e) {
    const error = new Error(`Invalid TCP payload received from the buildbot: ${e.message}\n${data}`)
    addErrorInfo(error, { type: 'buildbotClient' })
    throw error
  }
}

const deploySiteWithBuildbotClient = async function(client) {
  const payload = { action: 'deploySite' }
  try {
    const nextResponsePromise = getNextParsedResponsePromise(client)
    await writePayload(client, payload)
    const response = await nextResponsePromise

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
  startBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
}
