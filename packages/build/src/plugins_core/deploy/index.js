'use strict'

const { logDeploySuccess } = require('../../log/messages/plugins')

const {
  createBuildbotClient,
  connectBuildbotClient,
  closeBuildbotClient,
  deploySiteWithBuildbotClient,
} = require('./buildbot_client')

const onPostBuild = async function ({
  constants: { BUILDBOT_SERVER_SOCKET },
  events,
  utils: {
    build: { failBuild },
  },
}) {
  const client = createBuildbotClient(BUILDBOT_SERVER_SOCKET)
  try {
    await connectBuildbotClient(client)
    await deploySiteWithBuildbotClient({ client, events, failBuild })
    logDeploySuccess()
  } finally {
    await closeBuildbotClient(client)
  }
}

module.exports = { onPostBuild }
