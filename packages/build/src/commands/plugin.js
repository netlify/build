'use strict'

const { pipePluginOutput, unpipePluginOutput } = require('../log/stream')
const { callChild } = require('../plugins/ipc')
const { getSuccessStatus } = require('../status/success')

const { handlePluginError } = require('./error')

// Fire a plugin command
const firePluginCommand = async function ({
  event,
  childProcess,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
  envChanges,
  commands,
  events,
  error,
  logs,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    const { newEnvChanges, status } = await callChild(
      childProcess,
      'run',
      { event, events, error, envChanges, loadedFrom },
      { plugin: { pluginPackageJson, packageName }, location: { event, packageName, loadedFrom, origin } },
    )
    const newStatus = getSuccessStatus(status, { commands, event, packageName })
    return { newEnvChanges, newStatus }
  } catch (newError) {
    handlePluginError(newError, loadedFrom)
    return { newError }
  } finally {
    await unpipePluginOutput(childProcess, logs, listeners)
  }
}

module.exports = { firePluginCommand }
