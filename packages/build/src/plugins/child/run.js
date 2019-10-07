const { getLogic } = require('./logic')
const { getApiClient } = require('./api')

// Run a specific plugin hook
const run = async function({ pluginPath, pluginConfig, hookName, config, token, error, constants }) {
  const logic = getLogic(pluginPath, pluginConfig)
  const api = getApiClient({ logic, token })
  await logic[hookName]({ api, constants, pluginConfig, config, error })
  return {}
}

module.exports = { run }
