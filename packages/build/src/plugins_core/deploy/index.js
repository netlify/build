const {
  env: { NETLIFY_BUILD_EVENTS_ORDER },
} = require('process')

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
  } finally {
    await closeBuildbotClient(client)
  }
}

module.exports = NETLIFY_BUILD_EVENTS_ORDER === '1' ? { onBuild } : { onPostBuild: onBuild }
