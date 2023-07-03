import { supportedRuntimes } from '@netlify/framework-info'

import { getErrorInfo } from '../error/info.js'
import { startErrorMonitor } from '../error/monitor/start.js'
import { getBufferLogs, getSystemLogger } from '../log/logger.js'
import { logBuildStart } from '../log/messages/core.js'
import { loadPlugins } from '../plugins/load.js'
import { getPluginsOptions } from '../plugins/options.js'
import { pinPlugins } from '../plugins/pinned_version.js'
import { startPlugins, stopPlugins } from '../plugins/spawn.js'
import { addCorePlugins } from '../plugins_core/add.js'
import { reportStatuses } from '../status/report.js'
import { getDevSteps, getSteps } from '../steps/get.js'
import { runSteps } from '../steps/run_steps.js'
import { initTimers, measureDuration } from '../time/main.js'
import { startTracing } from '../tracing/main.js'

import { getConfigOpts, loadConfig } from './config.js'
import { getConstants } from './constants.js'
import { doDryRun } from './dry.js'
import { warnOnLingeringProcesses } from './lingering.js'
import { warnOnMissingSideFiles } from './missing_side_file.js'
import { normalizeFlags } from './normalize_flags.js'
import type { BuildFlags } from './types.js'

// Performed on build start. Must be kept small and unlikely to fail since it
// does not have proper error handling. Error handling relies on `errorMonitor`
// being built, which relies itself on flags being normalized.
export const startBuild = function (flags: Partial<BuildFlags>) {
  const timers = initTimers()

  const logs = getBufferLogs(flags)

  if (!flags.quiet) {
    logBuildStart(logs)
  }

  const { bugsnagKey, tracingOpts, debug, systemLogFile, ...flagsA } = normalizeFlags(flags, logs)
  const errorMonitor = startErrorMonitor({ flags: { tracingOpts, debug, systemLogFile, ...flagsA }, logs, bugsnagKey })
  startTracing(tracingOpts, getSystemLogger(logs, debug, systemLogFile))

  return { ...flagsA, debug, systemLogFile, errorMonitor, logs, timers }
}

const tExecBuild = async function ({
  config,
  defaultConfig,
  cachedConfig,
  cachedConfigPath,
  outputConfigPath,
  cwd,
  repositoryRoot,
  apiHost,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  env: envOpt,
  debug,
  systemLogFile,
  verbose,
  nodePath,
  functionsDistDir,
  edgeFunctionsDistDir,
  cacheDir,
  dry,
  mode,
  offline,
  deployId,
  buildId,
  testOpts,
  errorMonitor,
  errorParams,
  logs,
  timers,
  buildbotServerSocket,
  sendStatus,
  saveConfig,
  featureFlags,
  timeline,
  devCommand,
  quiet,
  framework,
  explicitSecretKeys,
}) {
  const configOpts = getConfigOpts({
    config,
    defaultConfig,
    cwd,
    repositoryRoot,
    apiHost,
    token,
    siteId,
    context,
    branch,
    baseRelDir,
    envOpt,
    mode,
    offline,
    deployId,
    buildId,
    testOpts,
    featureFlags,
  })
  const {
    netlifyConfig,
    configPath,
    headersPath,
    redirectsPath,
    buildDir,
    repositoryRoot: repositoryRootA,
    packageJson,
    userNodeVersion,
    childEnv,
    context: contextA,
    branch: branchA,
    token: tokenA,
    api,
    siteInfo,
    timers: timersA,
    integrations,
  } = await loadConfig({
    configOpts,
    cachedConfig,
    cachedConfigPath,
    envOpt,
    debug,
    logs,
    nodePath,
    timers,
    quiet,
  })

  if (featureFlags.build_automatic_runtime && framework) {
    const runtime = supportedRuntimes[framework]

    if (runtime !== undefined) {
      const skip = childEnv[runtime.skipFlag] === 'true'
      const installed = netlifyConfig.plugins.some((plugin) => plugin.package === runtime.package)

      if (!installed && !skip) {
        netlifyConfig.plugins.push({ package: runtime.package })
      }
    }
  }

  const constants = await getConstants({
    configPath,
    buildDir,
    functionsDistDir,
    edgeFunctionsDistDir,
    cacheDir,
    netlifyConfig,
    siteInfo,
    apiHost,
    token: tokenA,
    mode,
    testOpts,
  } as any)
  const systemLog = getSystemLogger(logs, debug, systemLogFile)
  const pluginsOptions = addCorePlugins({ netlifyConfig, constants })
  // `errorParams` is purposely stateful
  Object.assign(errorParams, { netlifyConfig, pluginsOptions, siteInfo, childEnv, userNodeVersion })

  const {
    pluginsOptions: pluginsOptionsA,
    netlifyConfig: netlifyConfigA,
    stepsCount,
    timers: timersB,
    configMutations,
    metrics,
  } = await runAndReportBuild({
    pluginsOptions,
    netlifyConfig,
    configOpts,
    siteInfo,
    configPath,
    outputConfigPath,
    headersPath,
    redirectsPath,
    buildDir,
    repositoryRoot: repositoryRootA,
    nodePath,
    packageJson,
    userNodeVersion,
    childEnv,
    context: contextA,
    branch: branchA,
    dry,
    mode,
    api,
    errorMonitor,
    deployId,
    errorParams,
    logs,
    debug,
    systemLog,
    verbose,
    timers: timersA,
    sendStatus,
    saveConfig,
    testOpts,
    buildbotServerSocket,
    constants,
    featureFlags,
    timeline,
    devCommand,
    quiet,
    integrations,
    explicitSecretKeys,
  })
  return {
    pluginsOptions: pluginsOptionsA,
    netlifyConfig: netlifyConfigA,
    siteInfo,
    userNodeVersion,
    stepsCount,
    timers: timersB,
    configMutations,
    metrics,
  }
}

export const execBuild = measureDuration(tExecBuild, 'total', { parentTag: 'build_site' })

// Runs a build then report any plugin statuses
export const runAndReportBuild = async function ({
  pluginsOptions,
  netlifyConfig,
  configOpts,
  siteInfo,
  configPath,
  outputConfigPath,
  headersPath,
  redirectsPath,
  buildDir,
  repositoryRoot,
  nodePath,
  packageJson,
  userNodeVersion,
  childEnv,
  context,
  branch,
  buildbotServerSocket,
  constants,
  dry,
  mode,
  api,
  errorMonitor,
  deployId,
  errorParams,
  logs,
  debug,
  systemLog,
  verbose,
  timers,
  sendStatus,
  saveConfig,
  testOpts,
  featureFlags,
  timeline,
  devCommand,
  quiet,
  integrations,
  explicitSecretKeys,
}) {
  try {
    const {
      stepsCount,
      netlifyConfig: netlifyConfigA,
      statuses,
      pluginsOptions: pluginsOptionsA,
      failedPlugins,
      timers: timersA,
      configMutations,
      metrics,
    } = await initAndRunBuild({
      pluginsOptions,
      netlifyConfig,
      configOpts,
      siteInfo,
      configPath,
      outputConfigPath,
      headersPath,
      redirectsPath,
      buildDir,
      repositoryRoot,
      nodePath,
      packageJson,
      userNodeVersion,
      childEnv,
      context,
      branch,
      dry,
      mode,
      api,
      errorMonitor,
      deployId,
      errorParams,
      logs,
      debug,
      systemLog,
      verbose,
      timers,
      sendStatus,
      saveConfig,
      testOpts,
      buildbotServerSocket,
      constants,
      featureFlags,
      timeline,
      devCommand,
      quiet,
      integrations,
      explicitSecretKeys,
    })
    await Promise.all([
      reportStatuses({
        statuses,
        childEnv,
        api,
        mode,
        pluginsOptions: pluginsOptionsA,
        netlifyConfig: netlifyConfigA,
        errorMonitor,
        deployId,
        logs,
        debug,
        sendStatus,
        testOpts,
      }),
      pinPlugins({
        pluginsOptions: pluginsOptionsA,
        failedPlugins,
        api,
        siteInfo,
        childEnv,
        mode,
        netlifyConfig: netlifyConfigA,
        errorMonitor,
        logs,
        debug,
        testOpts,
        sendStatus,
      }),
    ])

    return {
      pluginsOptions: pluginsOptionsA,
      netlifyConfig: netlifyConfigA,
      stepsCount,
      timers: timersA,
      configMutations,
      metrics,
    }
  } catch (error) {
    const [{ statuses }] = getErrorInfo(error)
    await reportStatuses({
      statuses,
      childEnv,
      api,
      mode,
      pluginsOptions,
      netlifyConfig,
      errorMonitor,
      deployId,
      logs,
      debug,
      sendStatus,
      testOpts,
    })
    throw error
  }
}

// Initialize plugin processes then runs a build
const initAndRunBuild = async function ({
  pluginsOptions,
  netlifyConfig,
  configOpts,
  siteInfo,
  configPath,
  outputConfigPath,
  headersPath,
  redirectsPath,
  buildDir,
  repositoryRoot,
  nodePath,
  packageJson,
  userNodeVersion,
  childEnv,
  context,
  branch,
  dry,
  mode,
  api,
  errorMonitor,
  deployId,
  errorParams,
  logs,
  debug,
  systemLog,
  verbose,
  sendStatus,
  saveConfig,
  timers,
  testOpts,
  buildbotServerSocket,
  constants,
  featureFlags,
  timeline,
  devCommand,
  quiet,
  integrations,
  explicitSecretKeys,
}) {
  const { pluginsOptions: pluginsOptionsA, timers: timersA } = await getPluginsOptions({
    pluginsOptions,
    netlifyConfig,
    siteInfo,
    buildDir,
    nodePath,
    packageJson,
    userNodeVersion,
    mode,
    api,
    logs,
    debug,
    sendStatus,
    timers,
    testOpts,
    featureFlags,
    integrations,
  })

  errorParams.pluginsOptions = pluginsOptionsA

  const { childProcesses, timers: timersB } = await startPlugins({
    pluginsOptions: pluginsOptionsA,
    buildDir,
    childEnv,
    logs,
    debug,
    timers: timersA,
    featureFlags,
    quiet,
  })

  try {
    const {
      stepsCount,
      netlifyConfig: netlifyConfigA,
      statuses,
      failedPlugins,
      timers: timersC,
      configMutations,
      metrics,
    } = await runBuild({
      childProcesses,
      pluginsOptions: pluginsOptionsA,
      netlifyConfig,
      configOpts,
      packageJson,
      configPath,
      outputConfigPath,
      userNodeVersion,
      headersPath,
      redirectsPath,
      buildDir,
      repositoryRoot,
      nodePath,
      childEnv,
      context,
      branch,
      dry,
      buildbotServerSocket,
      constants,
      mode,
      api,
      errorMonitor,
      deployId,
      errorParams,
      logs,
      debug,
      systemLog,
      verbose,
      saveConfig,
      timers: timersB,
      testOpts,
      featureFlags,
      timeline,
      devCommand,
      quiet,
      explicitSecretKeys,
    })

    await Promise.all([
      warnOnMissingSideFiles({ buildDir, netlifyConfig: netlifyConfigA, logs }),
      warnOnLingeringProcesses({ mode, logs, testOpts }),
    ])

    return {
      stepsCount,
      netlifyConfig: netlifyConfigA,
      statuses,
      pluginsOptions: pluginsOptionsA,
      failedPlugins,
      timers: timersC,
      configMutations,
      metrics,
    }
  } finally {
    // Terminate the child processes of plugins so that they don't linger after
    // the build is finished. The exception is when running in the dev timeline
    // since those are long-running events by nature.
    if (timeline !== 'dev') {
      stopPlugins(childProcesses)
    }
  }
}

// Load plugin main files, retrieve their event handlers then runs them,
// together with the build command
const runBuild = async function ({
  childProcesses,
  pluginsOptions,
  netlifyConfig,
  configOpts,
  packageJson,
  configPath,
  outputConfigPath,
  userNodeVersion,
  headersPath,
  redirectsPath,
  buildDir,
  repositoryRoot,
  nodePath,
  childEnv,
  context,
  branch,
  dry,
  buildbotServerSocket,
  constants,
  mode,
  api,
  errorMonitor,
  deployId,
  errorParams,
  logs,
  debug,
  systemLog,
  verbose,
  saveConfig,
  timers,
  testOpts,
  featureFlags,
  timeline,
  devCommand,
  quiet,
  explicitSecretKeys,
}) {
  const { pluginsSteps, timers: timersA } = await loadPlugins({
    pluginsOptions,
    childProcesses,
    packageJson,
    timers,
    logs,
    debug,
    verbose,
  })

  const { steps, events } = timeline === 'dev' ? getDevSteps(devCommand, pluginsSteps) : getSteps(pluginsSteps)

  if (dry) {
    await doDryRun({ buildDir, steps, netlifyConfig, constants, buildbotServerSocket, logs })
    return { netlifyConfig }
  }

  const {
    stepsCount,
    netlifyConfig: netlifyConfigA,
    statuses,
    failedPlugins,
    timers: timersB,
    configMutations,
    metrics,
  } = await runSteps({
    steps,
    buildbotServerSocket,
    events,
    configPath,
    outputConfigPath,
    headersPath,
    redirectsPath,
    buildDir,
    repositoryRoot,
    nodePath,
    childEnv,
    context,
    branch,
    constants,
    mode,
    api,
    errorMonitor,
    deployId,
    errorParams,
    netlifyConfig,
    configOpts,
    logs,
    debug,
    systemLog,
    verbose,
    saveConfig,
    timers: timersA,
    testOpts,
    featureFlags,
    quiet,
    userNodeVersion,
    explicitSecretKeys,
  })

  return {
    stepsCount,
    netlifyConfig: netlifyConfigA,
    statuses,
    failedPlugins,
    timers: timersB,
    configMutations,
    metrics,
  }
}
