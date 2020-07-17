const net = require('net')

const { addErrorInfo } = require('../error/info')

const startBuildbotClient = function(buildbotServerSocket) {
  return new Promise((resolve, reject) => {
    try {
      const client = net.createConnection(buildbotServerSocket)
      client.on('connect', () => resolve(client))
    } catch (error) {
      addErrorInfo(error, {
        type: 'buildbotClientStartup',
        location: { buildbotServerSocket },
      })
      reject(error)
    }
  })
}

const closeBuildbotClient = function(client) {
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

const deploySiteWithBuildbotClient = async function(client) {
  const payload = { action: 'deploySite' }
  try {
    const nextResponsePromise = getNextParsedResponsePromise(client)
    await writeDeployPayload(client, payload)
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
