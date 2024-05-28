import { promisify } from 'util'

import { addErrorInfo } from '../error/info.js'
import { addPluginLoadErrorStatus } from '../status/load_error.js'
import { measureDuration } from '../time/main.js'

import { callChild } from './ipc.js'

const pSetTimeout = promisify(setTimeout)

// Retrieve all plugins steps
// Can use either a module name or a file path to the plugin.
export const loadPlugins = async function ({
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
}) {
  return pluginsOptions.length === 0
    ? { pluginsSteps: [], timers }
    : await loadAllPlugins({
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
}

const tLoadAllPlugins = async function ({
  pluginsOptions,
  childProcesses,
  packageJson,
  logs,
  debug,
  verbose,
  netlifyConfig,
  featureFlags,
  systemLog,
}) {
  const pluginsSteps = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, {
        childProcesses,
        index,
        packageJson,
        logs,
        debug,
        verbose,
        netlifyConfig,
        featureFlags,
        systemLog,
      }),
    ),
  )
  const pluginsStepsA = pluginsSteps.flat()
  return { pluginsSteps: pluginsStepsA }
}

// Only performed if there are some plugins
const loadAllPlugins = measureDuration(tLoadAllPlugins, 'load_plugins')

// Retrieve plugin steps for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function (
  { packageName, pluginPackageJson, pluginPackageJson: { version } = {}, pluginPath, inputs, loadedFrom, origin },
  { childProcesses, index, packageJson, logs, debug, verbose, netlifyConfig, featureFlags, systemLog },
) {
  const { childProcess } = childProcesses[index]
  const loadEvent = 'load'

  // A buffer for any data piped into the child process' stderr. We'll pipe
  // this to system logs if we fail to load the plugin.
  const bufferedStdErr = []

  let bufferedStdListener

  if (featureFlags.netlify_build_plugin_system_log && childProcess.stderr) {
    bufferedStdListener = (data) => {
      bufferedStdErr.push(data.toString().trimEnd())
    }

    childProcess.stderr.on('data', bufferedStdListener)
  }

  try {
    const { events } = await callChild({
      childProcess,
      eventName: 'load',
      payload: { pluginPath, inputs, packageJson, verbose, netlifyConfig },
      logs,
      verbose: false,
    })
    const pluginSteps = events.map((event) => ({
      event,
      packageName,
      loadedFrom,
      origin,
      pluginPackageJson,
      childProcess,
    }))
    return pluginSteps
  } catch (error) {
    if (featureFlags.netlify_build_plugin_system_log) {
      // Wait for stderr to be flushed.
      await pSetTimeout(0)

      bufferedStdErr.forEach((line) => {
        systemLog(line)
      })
    }

    addErrorInfo(error, {
      plugin: { packageName, pluginPackageJson },
      location: { event: loadEvent, packageName, loadedFrom, origin },
    })
    addPluginLoadErrorStatus({ error, packageName, version, debug })
    throw error
  } finally {
    if (bufferedStdListener) {
      childProcess.stderr.removeListener('data', bufferedStdListener)
    }
  }
}
