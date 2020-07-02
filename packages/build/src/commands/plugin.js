const { pipePluginOutput, unpipePluginOutput } = require('../log/stream')
const { callChild } = require('../plugins/ipc')
const { getSuccessStatus } = require('../status/add')

// Fire a plugin command
const firePluginCommand = async function({
  event,
  childProcess,
  package,
  pluginPackageJson,
  loadedFrom,
  origin,
  envChanges,
  commands,
  error,
  logs,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    const { newEnvChanges, status } = await callChild(
      childProcess,
      'run',
      { event, error, envChanges },
      { plugin: { pluginPackageJson, package }, location: { event, package, loadedFrom, origin } },
    )
    const newStatus = getSuccessStatus(status, { commands, event, package })
    return { newEnvChanges, newStatus }
  } catch (newError) {
    return { newError }
  } finally {
    await unpipePluginOutput(childProcess, logs, listeners)
  }
}

module.exports = { firePluginCommand }
