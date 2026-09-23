import { context, propagation } from '@opentelemetry/api'
import type { PackageJson } from 'read-package-up'

import type { NetlifyPluginConstants } from '../core/constants.js'
import type { FeatureFlags } from '../core/feature_flags.js'
import type { ErrorParam } from '../core/types.js'
import type { EnvChanges } from '../env/changes.js'
import { addErrorInfo } from '../error/info.js'
import type { ErrorInfo } from '../error/types.js'
import { addOutputFlusher, type Logs } from '../log/logger.js'
import { logStepCompleted } from '../log/messages/ipc.js'
import { getStandardStreams, type OutputFlusher } from '../log/output_flusher.js'
import { pipePluginOutput, unpipePluginOutput } from '../log/stream.js'
import type { ConfigMutation } from '../plugins/child/diff.js'
import { callChild } from '../plugins/ipc.js'
import type { ChildProcess } from '../plugins/spawn.js'
import { isTrustedPlugin } from '../plugins/trusted.js'
import type { SystemLogger } from '../plugins_core/types.js'
import { getSuccessStatus } from '../status/success.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'

import { getPluginErrorType } from './error.js'
import { updateNetlifyConfig, listConfigSideFiles } from './update_config.js'

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
}: {
  event: string
  childProcess: ChildProcess
  packageName: string
  packagePath: string | undefined
  pluginPackageJson: PackageJson | undefined
  loadedFrom: string | undefined
  origin: string | undefined
  envChanges: EnvChanges
  errorParams: Pick<ErrorParam, 'netlifyConfig'>
  configOpts: Parameters<typeof updateNetlifyConfig>[0]['configOpts']
  netlifyConfig: NetlifyConfig
  defaultConfig: unknown
  configMutations: ConfigMutation[]
  headersPath: string | undefined
  redirectsPath: string | undefined
  constants: NetlifyPluginConstants
  steps: Parameters<typeof getSuccessStatus>[1]['steps']
  error: Error | undefined
  logs: Logs | undefined
  outputFlusher: OutputFlusher | undefined
  systemLog: SystemLogger
  featureFlags: FeatureFlags | undefined
  debug: boolean
  verbose: boolean
  extensionMetadata: NonNullable<ErrorInfo['plugin']>['extensionMetadata']
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
      configErrorType: 'pluginValidation',
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
