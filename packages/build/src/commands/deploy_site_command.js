const { deploySiteWithBuildbotClient } = require('../buildbot_client/main')
const { addErrorInfo } = require('../error/info')

const fireDeploySiteCommand = async function(buildbotClient) {
  try {
    await deploySiteWithBuildbotClient(buildbotClient)
    return {}
  } catch (newError) {
    addErrorInfo(newError, { type: 'buildbotServer' })
    return { newError }
  }
}

module.exports = {
  fireDeploySiteCommand,
}
