const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')

const onPostBuild = async function({ constants: { BUILDBOT_SERVER_SOCKET } }) {
  const client = createBuildbotClient(BUILDBOT_SERVER_SOCKET)
  try {
    await connectBuildbotClient(client)
    await deploySiteWithBuildbotClient(client)
  } finally {
    await closeBuildbotClient(client)
  }
}

module.exports = { onPostBuild }
