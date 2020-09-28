const { logDeploySuccess } = require('../../log/messages/plugins')

const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')

const onBuild = async function({ constants: { BUILDBOT_SERVER_SOCKET } }) {
  const client = createBuildbotClient(BUILDBOT_SERVER_SOCKET)
  try {
    await connectBuildbotClient(client)
    await deploySiteWithBuildbotClient(client)
    logDeploySuccess()
  } finally {
    await closeBuildbotClient(client)
  }
}

module.exports = { onBuild }
