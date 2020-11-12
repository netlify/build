'use strict'

const { addErrorInfo } = require('../error/info')
const { pipePluginOutput, unpipePluginOutput } = require('../log/stream')
const { run } = require('../plugins/child/run')
const { callChild } = require('../plugins/ipc')
const { getSuccessStatus } = require('../status/success')

const { getPluginErrorType } = require('./error')

// Fire a plugin command
const firePluginCommand = async function ({
  event,
  childProcess,
  context,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
  sameProcess,
  buildDir,
  envChanges,
  constants,
  commands,
  events,
  error,
  logs,
}) {
  try {
    const callProcessFunc = sameProcess ? callSameProcess : callChildProcess
    const { newEnvChanges, status } = await callProcessFunc({
      event,
      childProcess,
      context,
      loadedFrom,
      buildDir,
      envChanges,
      constants,
      events,
      error,
      logs,
    })
    const newStatus = getSuccessStatus(status, { commands, event, packageName })
    return { newEnvChanges, newStatus }
  } catch (newError) {
    const errorType = getPluginErrorType(newError, loadedFrom)
    addErrorInfo(newError, {
      ...errorType,
      plugin: { pluginPackageJson, packageName },
      location: { event, packageName, loadedFrom, origin },
    })
    return { newError }
  }
}

const callSameProcess = function ({ context, event, loadedFrom, buildDir, constants, events, error, logs }) {
  return run(
    { event, events, error, envChanges: {}, constants: { ...constants, BUILD_DIR: buildDir }, loadedFrom, logs },
    context,
  )
}

const callChildProcess = async function ({
  event,
  childProcess,
  loadedFrom,
  envChanges,
  constants,
  events,
  error,
  logs,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    return await callChild(childProcess, 'run', {
      event,
      events,
      error,
      envChanges,
      constants,
      loadedFrom,
    })
  } finally {
    await unpipePluginOutput(childProcess, logs, listeners)
  }
}

module.exports = { firePluginCommand }
