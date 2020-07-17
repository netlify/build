const { deploySiteWithBuildbotClient } = require('../buildbot_client/main')
const { addErrorInfo } = require('../error/info')

const fireDeploySiteCommand = async function(buildbotClient) {
  await deploySiteWithBuildbotClient(buildbotClient)
  return {}
}

module.exports = {
  fireDeploySiteCommand,
}
