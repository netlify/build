import { addAttributesToActiveSpan } from '@netlify/opentelemetry-utils'

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
import { getBlobsEnvironmentContext } from '../utils/blobs.js'

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

  const { bugsnagKey, debug, systemLogFile, ...flagsA } = normalizeFlags(flags, logs)
  const errorMonitor = startErrorMonitor({ flags: { debug, systemLogFile, ...flagsA }, logs, bugsnagKey })

  return { ...flagsA, debug, systemLogFile, errorMonitor, logs, timers }
}

const tExecBuild = async function ({
  config,
  defaultConfig,
  cachedConfig,
  cachedConfigPath,
  outputConfigPath,
  cwd,
  packagePath,
  repositoryRoot,
  apiHost,
  token,
  siteId,
  accountId,
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
  explicitSecretKeys,
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
  eventHandlers,
  skewProtectionToken,
}) {
  const configOpts = getConfigOpts({
    config,
    defaultConfig,
    cwd,
    repositoryRoot,
    packagePath,
    apiHost,
    token,
    siteId,
    accountId,
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
    skewProtectionToken,
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
    defaultConfig,
    cachedConfigPath,
    envOpt,
    debug,
    logs,
    nodePath,
    timers,
    quiet,
    featureFlags,
  })

  const constants = await getConstants({
    configPath,
    buildDir,
    functionsDistDir,
    edgeFunctionsDistDir,
    cacheDir,
    packagePath,
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
    returnValues,
  } = await runAndReportBuild({
    pluginsOptions,
    netlifyConfig,
    defaultConfig,
    configOpts,
    siteInfo,
    configPath,
    outputConfigPath,
    headersPath,
    redirectsPath,
    buildDir,
    repositoryRoot: repositoryRootA,
    packagePath,
    nodePath,
    packageJson,
    userNodeVersion,
    childEnv,
    context: contextA,
    branch: branchA,
    dry,
    mode,
    api,
    token,
    errorMonitor,
    deployId,
    errorParams,
    logs,
    debug,
    systemLog,
    systemLogFile,
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
    enhancedSecretScan,
    edgeFunctionsBootstrapURL,
    eventHandlers,
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
    returnValues,
  }
}

export const execBuild = measureDuration(tExecBuild, 'total', { parentTag: 'build_site' })

// Runs a build then report any plugin statuses
export const runAndReportBuild = async function ({
  pluginsOptions,
  netlifyConfig,
  defaultConfig,
  configOpts,
  siteInfo,
  configPath,
  outputConfigPath,
  headersPath,
  redirectsPath,
  packagePath,
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
  token,
  errorMonitor,
  deployId,
  errorParams,
  logs,
  debug,
  systemLog,
  systemLogFile,
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
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
  eventHandlers,
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
      returnValues,
    } = await initAndRunBuild({
      pluginsOptions,
      netlifyConfig,
      defaultConfig,
      configOpts,
      siteInfo,
      configPath,
      outputConfigPath,
      headersPath,
      redirectsPath,
      buildDir,
      packagePath,
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
      token,
      errorMonitor,
      deployId,
      errorParams,
      logs,
      debug,
      systemLog,
      systemLogFile,
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
      enhancedSecretScan,
      edgeFunctionsBootstrapURL,
      eventHandlers,
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
      returnValues,
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
  defaultConfig,
  configOpts,
  siteInfo,
  configPath,
  outputConfigPath,
  headersPath,
  redirectsPath,
  buildDir,
  packagePath,
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
  token,
  errorMonitor,
  deployId,
  errorParams,
  logs,
  debug,
  systemLog,
  systemLogFile,
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
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
  eventHandlers,
}) {
  const pluginsEnv = {
    ...childEnv,
    ...getBlobsEnvironmentContext({ api, deployId: deployId, siteId: siteInfo?.id, token }),
  }

  const { pluginsOptions: pluginsOptionsA, timers: timersA } = await getPluginsOptions({
    pluginsOptions,
    netlifyConfig,
    siteInfo,
    buildDir,
    nodePath,
    packagePath,
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
    context,
    systemLog,
    pluginsEnv,
  })

  if (pluginsOptionsA?.length) {
    const buildPlugins = {}
    for (const plugin of pluginsOptionsA) {
      if (plugin?.pluginPackageJson?.name) {
        buildPlugins[`build.plugins['${plugin.pluginPackageJson.name}']`] = plugin?.pluginPackageJson?.version ?? 'N/A'
      }
    }

    addAttributesToActiveSpan(buildPlugins)
  }

  errorParams.pluginsOptions = pluginsOptionsA

  const { childProcesses, timers: timersB } = await startPlugins({
    pluginsOptions: pluginsOptionsA,
    buildDir,
    childEnv: pluginsEnv,
    logs,
    debug,
    timers: timersA,
    featureFlags,
    quiet,
    systemLog,
    systemLogFile,
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
      returnValues,
    } = await runBuild({
      childProcesses,
      pluginsOptions: pluginsOptionsA,
      netlifyConfig,
      defaultConfig,
      configOpts,
      packageJson,
      configPath,
      outputConfigPath,
      userNodeVersion,
      headersPath,
      redirectsPath,
      buildDir,
      packagePath,
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
      enhancedSecretScan,
      edgeFunctionsBootstrapURL,
      eventHandlers,
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
      returnValues,
    }
  } finally {
    // Terminate the child processes of plugins so that they don't linger after
    // the build is finished. The exception is when running in the dev timeline
    // since those are long-running events by nature.
    if (timeline !== 'dev') {
      await stopPlugins({
        childProcesses,
        pluginOptions: pluginsOptionsA,
        netlifyConfig,
        logs,
        verbose,
      })
    }
  }
}

// Load plugin main files, retrieve their event handlers then runs them,
// together with the build command
const runBuild = async function ({
  childProcesses,
  pluginsOptions,
  netlifyConfig,
  defaultConfig,
  configOpts,
  packageJson,
  configPath,
  outputConfigPath,
  userNodeVersion,
  headersPath,
  redirectsPath,
  buildDir,
  repositoryRoot,
  packagePath,
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
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
  eventHandlers,
}) {
  const { pluginsSteps, timers: timersA } = await loadPlugins({
    pluginsOptions,
    childProcesses,
    packageJson,
    timers,
    logs,
    debug,
    verbose,
    netlifyConfig,
    featureFlags,
    systemLog,
  })

  const { steps, events } =
    timeline === 'dev' ? getDevSteps(devCommand, pluginsSteps, eventHandlers) : getSteps(pluginsSteps, eventHandlers)

  if (dry) {
    await doDryRun({ buildDir, steps, netlifyConfig, constants, buildbotServerSocket, logs, featureFlags })
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
    returnValues,
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
    packagePath,
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
    defaultConfig,
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
    enhancedSecretScan,
    edgeFunctionsBootstrapURL,
  })

  return {
    stepsCount,
    netlifyConfig: netlifyConfigA,
    statuses,
    failedPlugins,
    timers: timersB,
    configMutations,
    metrics,
    returnValues,
  }
}
