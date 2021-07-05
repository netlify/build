'use strict'

const { listConfigSideFiles } = require('@netlify/config')

const { addErrorInfo } = require('../error/info')
const { pipePluginOutput, unpipePluginOutput } = require('../log/stream')
const { callChild } = require('../plugins/ipc')
const { getSuccessStatus } = require('../status/success')

const { getPluginErrorType } = require('./error')
const { updateNetlifyConfig } = require('./update_config')

// Fire a plugin command
const firePluginCommand = async function ({
  event,
  childProcess,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
  buildDir,
  envChanges,
  errorParams,
  configOpts,
  netlifyConfig,
  configMutations,
  constants,
  commands,
  error,
  logs,
  debug,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    const configSideFiles = await listConfigSideFiles(netlifyConfig, buildDir)
    const {
      newEnvChanges,
      configMutations: newConfigMutations,
      status,
    } = await callChild(childProcess, 'run', {
      event,
      error,
      envChanges,
      netlifyConfig,
      constants,
    })
    const { netlifyConfig: netlifyConfigA, configMutations: configMutationsA } = await updateNetlifyConfig({
      configOpts,
      netlifyConfig,
      buildDir,
      configMutations,
      newConfigMutations,
      configSideFiles,
      errorParams,
      logs,
      debug,
    })
    const newStatus = getSuccessStatus(status, { commands, event, packageName })
    return { newEnvChanges, netlifyConfig: netlifyConfigA, configMutations: configMutationsA, newStatus }
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
