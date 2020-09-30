const { logDeploySuccess } = require('../../log/messages/plugins')

const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')

const onPostBuild = async function({ constants: { BUILDBOT_SERVER_SOCKET, BUILDBOT_SERVER_SOCKET_TIMEOUT }, events }) {
  const client = createBuildbotClient({ BUILDBOT_SERVER_SOCKET, BUILDBOT_SERVER_SOCKET_TIMEOUT })
  try {
    await connectBuildbotClient(client)
    await deploySiteWithBuildbotClient({ client, events })
    logDeploySuccess()
  } finally {
    await closeBuildbotClient(client)
  }
}

module.exports = { onPostBuild }
