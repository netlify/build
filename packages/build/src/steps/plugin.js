import { context, propagation } from '@opentelemetry/api'

import { addErrorInfo } from '../error/info.js'
import { logStepCompleted } from '../log/messages/ipc.js'
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
  configMutations,
  headersPath,
  redirectsPath,
  constants,
  steps,
  error,
  logs,
  systemLog,
  featureFlags,
  debug,
  verbose,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  const otelCarrier = {}
  propagation.inject(context.active(), otelCarrier)

  try {
    const configSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
    const {
      newEnvChanges,
      configMutations: newConfigMutations,
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
      },
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
      packagePath,
      redirectsPath,
      configMutations,
      newConfigMutations,
      configSideFiles,
      errorParams,
      logs,
      systemLog,
      debug,
      source: packageName,
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
    const errorType = getPluginErrorType(newError, loadedFrom, packageName)
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
