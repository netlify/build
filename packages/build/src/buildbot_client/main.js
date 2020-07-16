const net = require('net')
const { addErrorInfo } = require('../error/info')

const getBuildbotClient = function(buildbotServerSocket) {
  return new Promise((resolve, reject) => {
    try {
      const client = net.createConnection(buildbotServerSocket)
      client.on('connect', () => resolve(client))
    } catch (e) {
      addErrorInfo(error, { type: 'buildbotServerClientStartup' })
      reject(e)
    }
  })
}

const closeBuildbotClient = function(buildbotClient) {
  client.end()
  return
}

const writeDeployPayload = function(client, payload) {
  return new Promise((resolve, reject) => {
    try {
      client.write(JSON.stringify(payload), resolve)
    } catch (e) {
      reject(e)
    }
  })
}

const getNextParsedResponsePromise = function(client) {
  return new Promise(function(resolve, reject) {
    try {
      client.on('data', function(data) {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

const deploySiteWithBuildbotClient = async function(buildbotClient) {
  try {
    const nextResponsePromise = getNextParsedResponsePromise(client)
    await writeDeployPayload(buildbotClient, { action: 'deploySite' })
    const response = await nextResponsePromise

    if (!response.succeeded) {
      throw new Error(`Deploy did not succeed: ${response.values.error}`)
    }
  } catch (error) {
    addErrorInfo(error, { type: 'buildbotServer' })
    throw error
  }

  return
}

module.exports = {
  getBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
}
