'use strict'

const { resolveUpdatedConfig } = require('../core/config')
const { addErrorInfo } = require('../error/info')
const { logConfigOnUpdate } = require('../log/messages/config')
const { pipePluginOutput, unpipePluginOutput } = require('../log/stream')
const { callChild } = require('../plugins/ipc')
const { applyMutations } = require('../plugins/mutations')
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
  configOpts,
  netlifyConfig,
  priorityConfig,
  constants,
  commands,
  error,
  logs,
  debug,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    const { newEnvChanges, configMutations, status } = await callChild(childProcess, 'run', {
      event,
      error,
      envChanges,
      netlifyConfig,
      constants,
    })
    const { netlifyConfig: netlifyConfigA, priorityConfig: priorityConfigA } = await updateNetlifyConfig({
      configOpts,
      priorityConfig,
      netlifyConfig,
      configMutations,
      errorParams,
      logs,
      debug,
    })
    const newStatus = getSuccessStatus(status, { commands, event, packageName })
    return { newEnvChanges, netlifyConfig: netlifyConfigA, priorityConfig: priorityConfigA, newStatus }
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

const updateNetlifyConfig = async function ({
  configOpts,
  priorityConfig,
  netlifyConfig,
  configMutations,
  errorParams,
  logs,
  debug,
}) {
  if (configMutations.length === 0) {
    return { netlifyConfig, priorityConfig }
  }

  const priorityConfigA = applyMutations(priorityConfig, configMutations)
  const netlifyConfigA = await resolveUpdatedConfig(configOpts, priorityConfigA)
  logConfigOnUpdate({ logs, netlifyConfig: netlifyConfigA, debug })
  // eslint-disable-next-line fp/no-mutation,no-param-reassign
  errorParams.netlifyConfig = netlifyConfigA
  return { netlifyConfig: netlifyConfigA, priorityConfig: priorityConfigA }
}

module.exports = { firePluginCommand }
