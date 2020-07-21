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
    addErrorInfo(error, { type: 'buildbotClientStartup' })
    throw error
  }
}

const closeBuildbotClient = async function(buildbotClient) {
  if (buildbotClient === undefined) {
    return
  }
  await promisify(buildbotClient.end.bind(buildbotClient))()
}

module.exports = {
  startBuildbotClient,
  closeBuildbotClient,
}
