const net = require('net')

const { addErrorInfo } = require('../error/info')

const connectToBuildbotServer = function(buildbotServerSocket) {
  return new Promise((resolve, reject) => {
    try {
      const client = net.createConnection(buildbotServerSocket)
      client.on('connect', () => resolve(client))
    } catch (e) {
      reject(e)
    }
  })
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

const deploySite = async function(buildbotServerSocket) {
  const client = await connectToBuildbotServer(buildbotServerSocket)

  const nextResponsePromise = getNextParsedResponsePromise(client)
  await writeDeployPayload(client, { action: 'deploySite' })
  const response = await nextResponsePromise

  if (!response.succeeded) {
    throw new Error(`Deploy did not succeed: ${response.values.error}`)
  }

  client.end()

  return
}

const fireDeploySiteCommand = async function(buildbotServerSocket) {
  try {
    await deploySite(buildbotServerSocket)
    return {}
  } catch (newError) {
    addErrorInfo(newError, { type: 'deploySiteCommand' })
    return { newError }
  }
}

module.exports = {
  fireDeploySiteCommand,
}
