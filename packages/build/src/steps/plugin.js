'use strict'

const { addErrorInfo } = require('../error/info')
const { logStepCompleted } = require('../log/messages/ipc')
const { pipePluginOutput, unpipePluginOutput } = require('../log/stream')
const { callChild } = require('../plugins/ipc')
const { getSuccessStatus } = require('../status/success')

const { getPluginErrorType } = require('./error')
const { updateNetlifyConfig, listConfigSideFiles } = require('./update_config')

// Fire a plugin step
const firePluginStep = async function ({
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
  configMutations,
  headersPath,
  redirectsPath,
  constants,
  steps,
  error,
  logs,
  debug,
  verbose,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    const configSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
    const {
      newEnvChanges,
      configMutations: newConfigMutations,
      status,
    } = await callChild({
      childProcess,
      eventName: 'run',
      payload: { event, error, envChanges, netlifyConfig, constants },
      logs,
      verbose,
    })
    const {
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      headersPath: headersPathA,
      redirectsPath: redirectsPathA,
    } = await updateNetlifyConfig({
      configOpts,
      netlifyConfig,
      headersPath,
      redirectsPath,
      configMutations,
      newConfigMutations,
      configSideFiles,
      errorParams,
      logs,
      debug,
    })
    const newStatus = getSuccessStatus(status, { steps, event, packageName })
    return {
      newEnvChanges,
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      headersPath: headersPathA,
      redirectsPath: redirectsPathA,
      newStatus,
    }
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
    logStepCompleted(logs, verbose)
  }
}

module.exports = { firePluginStep }
