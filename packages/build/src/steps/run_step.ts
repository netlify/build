import { setMultiSpanAttributes } from '@netlify/opentelemetry-utils'
import { trace } from '@opentelemetry/api'

import { addMutableConstants } from '../core/constants.js'
import { logStepStart } from '../log/messages/steps.js'
import { OutputFlusher } from '../log/output_flusher.js'
import { runsAlsoOnBuildFailure, runsOnlyOnBuildFailure } from '../plugins/events.js'
import { normalizeTagName } from '../report/statsd.js'
import { measureDuration } from '../time/main.js'
import { StepExecutionAttributes } from '../tracing/main.js'

import { fireCoreStep } from './core_step.js'
import { firePluginStep } from './plugin.js'
import { getStepReturn } from './return.js'

const tracer = trace.getTracer('steps')

// Run a step (core, build command or plugin)
export const runStep = async function ({
  event,
  childProcess,
  packageName,
  coreStep,
  coreStepId,
  coreStepName,
  coreStepDescription,
  coreStepQuiet,
  pluginPackageJson,
  loadedFrom,
  origin,
  condition,
  configPath,
  outputConfigPath,
  buildDir,
  packagePath,
  repositoryRoot,
  nodePath,
  index,
  childEnv,
  context,
  branch,
  envChanges,
  constants,
  steps,
  buildbotServerSocket,
  events,
  mode,
  api,
  errorMonitor,
  deployId,
  errorParams,
  error,
  failedPlugins,
  configOpts,
  netlifyConfig,
  defaultConfig,
  configMutations,
  headersPath,
  redirectsPath,
  logs,
  debug,
  systemLog,
  verbose,
  saveConfig,
  timers,
  testOpts,
  featureFlags,
  quiet,
  userNodeVersion,
  explicitSecretKeys,
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
  extensionMetadata,
  returnValues,
}) {
  // Add relevant attributes to the upcoming span context
  const attributes: StepExecutionAttributes = {
    'build.execution.step.name': coreStepName,
    'build.execution.step.package_name': packageName,
    'build.execution.step.package_path': packagePath,
    'build.execution.step.build_dir': buildDir,
    'build.execution.step.id': coreStepId,
    'build.execution.step.loaded_from': loadedFrom,
    'build.execution.step.origin': origin,
    'build.execution.step.event': event,
  }

  if (pluginPackageJson?.name && pluginPackageJson?.version) {
    attributes['build.execution.step.plugin_name'] = pluginPackageJson.name
    attributes['build.execution.step.plugin_version'] = pluginPackageJson.version
  }

  const spanCtx = setMultiSpanAttributes(attributes)
  // If there's no `coreStepId` then this is a plugin execution
  const spanName = `run-step-${coreStepId || `plugin-${event}`}`

  return tracer.startActiveSpan(spanName, {}, spanCtx, async (span) => {
    const constantsA = await addMutableConstants({ constants, buildDir, netlifyConfig })

    const shouldRun = await shouldRunStep({
      event,
      packageName,
      error,
      failedPlugins,
      netlifyConfig,
      condition,
      packagePath,
      constants: constantsA,
      buildbotServerSocket,
      buildDir,
      saveConfig,
      explicitSecretKeys,
      enhancedSecretScan,
      deployId,
      returnValues,
      featureFlags,
    })
    span.setAttribute('build.execution.step.should_run', shouldRun)
    if (!shouldRun) {
      span.end()
      return {}
    }

    const logPluginStart =
      !quiet && !coreStepQuiet
        ? () => logStepStart({ logs, event, packageName, coreStepDescription, error, netlifyConfig })
        : () => {
            // no-op
          }

    const outputFlusher = new OutputFlusher(logPluginStart)

    const fireStep = getFireStep(packageName, coreStepId, event)
    const {
      newEnvChanges,
      netlifyConfig: netlifyConfigA = netlifyConfig,
      configMutations: configMutationsA = configMutations,
      headersPath: headersPathA = headersPath,
      redirectsPath: redirectsPathA = redirectsPath,
      newError,
      newStatus,
      timers: timersA,
      durationNs,
      metrics,
      returnValue,
    } = await fireStep({
      extensionMetadata,
      defaultConfig,
      event,
      childProcess,
      packageName,
      pluginPackageJson,
      loadedFrom,
      outputFlusher,
      origin,
      coreStep,
      coreStepId,
      coreStepName,
      packagePath,
      configPath,
      outputConfigPath,
      buildDir,
      repositoryRoot,
      nodePath,
      childEnv,
      context,
      branch,
      envChanges,
      constants: constantsA,
      steps,
      buildbotServerSocket,
      events,
      error,
      logs,
      debug,
      quiet,
      systemLog,
      verbose,
      saveConfig,
      timers,
      errorParams,
      configOpts,
      netlifyConfig,
      configMutations,
      headersPath,
      redirectsPath,
      featureFlags,
      userNodeVersion,
      explicitSecretKeys,
      enhancedSecretScan,
      edgeFunctionsBootstrapURL,
      deployId,
      api,
      returnValues,
    })

    const newValues = await getStepReturn({
      event,
      packageName,
      newError,
      newEnvChanges,
      newStatus,
      coreStep,
      coreStepName,
      childEnv,
      mode,
      api,
      errorMonitor,
      deployId,
      netlifyConfig: netlifyConfigA,
      configMutations: configMutationsA,
      headersPath: headersPathA,
      redirectsPath: redirectsPathA,
      logs,
      outputFlusher,
      debug,
      timers: timersA,
      durationNs,
      testOpts,
      systemLog,
      quiet: quiet || coreStepQuiet,
      metrics,
      returnValue,
    })

    span.end()
    return { ...newValues, newIndex: index + 1 }
  })
}

// A plugin fails _without making the build fail_ when either:
//   - using `utils.build.failPlugin()`
//   - the failure happens after deploy. This means: inside any `onError`,
//     `onSuccess` or `onEnd` event handler.
//
// When that happens, no other events for that specific plugin is run.
// Not even `onError` and `onEnd`.
// Plugins should use `try`/`catch`/`finally` blocks to handle exceptions,
// not `onError` nor `onEnd`.
//
// Otherwise, most failures will make the build fail. This includes:
//   - the build command failed
//   - Functions or Edge Functions bundling failed
//   - the deploy failed (deploying files to our CDN)
//   - a plugin `onPreBuild`, `onBuild` or `onPostBuild` event handler failed.
//     This includes uncaught exceptions and using `utils.build.failBuild()`
//     or `utils.build.cancelBuild()`.
//
// `onError` is triggered when the build failed.
// It means "on build failure" not "on plugin failure".
// `onSuccess` is the opposite. It is triggered after the build succeeded.
// `onEnd` is triggered after the build either failed or succeeded.
// It is useful for resources cleanup.
//
// Finally, some plugins (only core plugins for the moment) might be enabled or
// not depending on whether a specific action is happening during the build,
// such as creating a file. For example, the Functions and Edge Functions core
// plugins are disabled if no Functions or Edge Functions directory is specified
// or available. However, one might be created by a build plugin, in which case,
// those core plugins should be triggered. We use a dynamic `condition()` to
// model this behavior.
const shouldRunStep = async function ({
  event,
  packageName,
  error,
  packagePath,
  failedPlugins,
  netlifyConfig,
  condition,
  constants,
  buildbotServerSocket,
  buildDir,
  saveConfig,
  explicitSecretKeys,
  enhancedSecretScan,
  deployId,
  returnValues,
  featureFlags = {},
}) {
  if (
    failedPlugins.includes(packageName) ||
    (condition !== undefined &&
      !(await condition({
        packagePath,
        buildDir,
        constants,
        buildbotServerSocket,
        netlifyConfig,
        saveConfig,
        explicitSecretKeys,
        enhancedSecretScan,
        deployId,
        returnValues,
        featureFlags,
      })))
  ) {
    return false
  }

  if (error !== undefined) {
    return runsAlsoOnBuildFailure(event)
  }

  return !runsOnlyOnBuildFailure(event)
}

// Wrap step function to measure its time
const getFireStep = function (packageName: string, coreStepId?: string, event?: string) {
  if (coreStepId !== undefined) {
    return measureDuration(tFireStep, coreStepId)
  }

  const parentTag = normalizeTagName(packageName)
  return measureDuration(tFireStep, event, { parentTag, category: 'pluginEvent' })
}

const tFireStep = function ({
  defaultConfig,
  event,
  childProcess,
  packageName,
  pluginPackageJson,
  loadedFrom,
  outputFlusher,
  origin,
  coreStep,
  coreStepId,
  coreStepName,
  configPath,
  outputConfigPath,
  buildDir,
  repositoryRoot,
  packagePath,
  nodePath,
  childEnv,
  context,
  branch,
  envChanges,
  constants,
  steps,
  buildbotServerSocket,
  events,
  error,
  logs,
  debug,
  quiet,
  systemLog,
  verbose,
  saveConfig,
  errorParams,
  configOpts,
  netlifyConfig,
  configMutations,
  headersPath,
  redirectsPath,
  featureFlags,
  userNodeVersion,
  explicitSecretKeys,
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
  deployId,
  extensionMetadata,
  api,
  returnValues,
}) {
  if (coreStep !== undefined) {
    return fireCoreStep({
      coreStep,
      coreStepId,
      coreStepName,
      configPath,
      outputConfigPath,
      buildDir,
      repositoryRoot,
      packagePath,
      constants,
      buildbotServerSocket,
      events,
      logs,
      outputFlusher,
      quiet,
      nodePath,
      childEnv,
      context,
      branch,
      envChanges,
      errorParams,
      configOpts,
      netlifyConfig,
      defaultConfig,
      configMutations,
      headersPath,
      redirectsPath,
      featureFlags,
      debug,
      systemLog,
      saveConfig,
      userNodeVersion,
      explicitSecretKeys,
      enhancedSecretScan,
      edgeFunctionsBootstrapURL,
      deployId,
      api,
      returnValues,
    })
  }

  return firePluginStep({
    event,
    childProcess,
    packageName,
    packagePath,
    pluginPackageJson,
    loadedFrom,
    outputFlusher,
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
    systemLog,
    featureFlags,
    debug,
    verbose,
    extensionMetadata,
  })
}
