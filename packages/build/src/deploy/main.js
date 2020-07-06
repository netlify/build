const net = require('net')

const connectToBuildbotServer = function({ buildbotServerSocket }) {
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
      client.write(JSON.stringify(payload), (...args) => resolve(...args))
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

const deploySite = async function({ buildbotServerSocket }) {
  const client = await connectToBuildbotServer(buildbotServerSocket)

  const nextResponsePromise = getNextParsedResponsePromise(client)

  await writeDeployPayload({
    action: 'deployFiles',
  })

  const response = await nextResponsePromise

  if (!response.succeeded) {
    throw new Error(`Deploy did not succeed: ${response.values.error}`)
  }

  return
}

module.exports = {
  deploySite,
}
