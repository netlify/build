'use strict'

const { addErrorInfo } = require('../error/info')
const { pipePluginOutput, unpipePluginOutput } = require('../log/stream')
const { callChild } = require('../plugins/ipc')
const { getSuccessStatus } = require('../status/success')

const { getPluginErrorType } = require('./error')

// Fire a plugin command
const firePluginCommand = async function ({
  event,
  childProcess,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
  envChanges,
  errorParams,
  netlifyConfig,
  constants,
  commands,
  error,
  logs,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    const {
      newEnvChanges,
      netlifyConfig: netlifyConfigA,
      status,
    } = await callChild(childProcess, 'run', {
      event,
      error,
      envChanges,
      netlifyConfig,
      constants,
    })
    // eslint-disable-next-line fp/no-mutation,no-param-reassign
    errorParams.netlifyConfig = netlifyConfigA
    const newStatus = getSuccessStatus(status, { commands, event, packageName })
    return { newEnvChanges, netlifyConfig: netlifyConfigA, newStatus }
  } catch (newError) {
    const errorType = getPluginErrorType(newError, loadedFrom)
    addErrorInfo(newError, {
      ...errorType,
      plugin: { pluginPackageJson, packageName },
      location: { event, packageName, loadedFrom, origin },
    })
    return { newError }
  } finally {
    await unpipePluginOutput(childProcess, logs, listeners)
  }
}

module.exports = { firePluginCommand }
