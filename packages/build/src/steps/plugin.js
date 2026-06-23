import { context, propagation } from '@opentelemetry/api'

import { addErrorInfo } from '../error/info.js'
import { addOutputFlusher } from '../log/logger.js'
import { logStepCompleted } from '../log/messages/ipc.js'
import { getStandardStreams } from '../log/output_flusher.js'
import { pipePluginOutput, unpipePluginOutput } from '../log/stream.js'
import { callChild } from '../plugins/ipc.js'
import { getSuccessStatus } from '../status/success.js'

import { getPluginErrorType } from './error.js'
import { updateNetlifyConfig, listConfigSideFiles } from './update_config.js'

export const isTrustedPlugin = (packageName) => packageName?.startsWith('@netlify/')

// Fire a plugin step
export const firePluginStep = async function ({
  event,
  childProcess,
  packageName,
  packagePath,
  pluginPackageJson,
  loadedFrom,
  origin,
  envChanges,
  errorParams,
  configOpts,
  netlifyConfig,
  defaultConfig,
  configMutations,
  headersPath,
  redirectsPath,
  constants,
  steps,
  error,
  logs,
  outputFlusher,
  systemLog,
  featureFlags,
  debug,
  verbose,
  extensionMetadata,
}) {
  const standardStreams = getStandardStreams(outputFlusher)
  const listeners = pipePluginOutput(childProcess, logs, standardStreams)

  const otelCarrier = {}
  propagation.inject(context.active(), otelCarrier)

  const logsA = outputFlusher ? addOutputFlusher(logs, outputFlusher) : logs

  try {
    const configSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
    const {
      configMutations: newConfigMutations,
      deployEnvVars,
      newEnvChanges,
      returnValue,
      status,
    } = await callChild({
      childProcess,
      eventName: 'run',
      payload: {
        event,
        error,
        envChanges,
        featureFlags: isTrustedPlugin(pluginPackageJson?.name) ? featureFlags : undefined,
        netlifyConfig,
        constants,
        otelCarrier,
        extensionMetadata,
      },
      logs: logsA,
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
      defaultConfig,
      headersPath,
      packagePath,
      redirectsPath,
      configMutations,
      newConfigMutations,
      configSideFiles,
      errorParams,
      logs: logsA,
      systemLog,
      debug,
      source: packageName,
    })
    const newStatus = getSuccessStatus(status, { steps, event, packageName })
    return {
      deployEnvVars,
      newEnvChanges,
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      headersPath: headersPathA,
      redirectsPath: redirectsPathA,
      newStatus,
      returnValue,
    }
  } catch (newError) {
    const errorType = getPluginErrorType(newError, loadedFrom, packageName)
    addErrorInfo(newError, {
      ...errorType,
      plugin: { pluginPackageJson, packageName, extensionMetadata },
      location: { event, packageName, loadedFrom, origin },
    })
    return { newError }
  } finally {
    if (!isTrustedPlugin(pluginPackageJson?.name) || listeners) {
      await unpipePluginOutput(childProcess, logs, listeners, standardStreams)
    }
    logStepCompleted(logs, verbose)
  }
}
