import { addErrorInfo } from '../error/info.js'
import { addPluginLoadErrorStatus } from '../status/load_error.js'
import { measureDuration } from '../time/main.js'

import { callChild } from './ipc.js'

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
}) {
  return pluginsOptions.length === 0
    ? { pluginsSteps: [], timers }
    : await loadAllPlugins({ pluginsOptions, childProcesses, packageJson, timers, logs, debug, verbose })
}

const tLoadAllPlugins = async function ({ pluginsOptions, childProcesses, packageJson, logs, debug, verbose }) {
  const pluginsSteps = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, { childProcesses, index, packageJson, logs, debug, verbose }),
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
  { childProcesses, index, packageJson, logs, debug, verbose },
) {
  const { childProcess } = childProcesses[index]
  const loadEvent = 'load'

  try {
    const { events } = await callChild({
      childProcess,
      eventName: 'load',
      payload: { pluginPath, inputs, packageJson, verbose },
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
    addErrorInfo(error, {
      plugin: { packageName, pluginPackageJson },
      location: { event: loadEvent, packageName, loadedFrom, origin },
    })
    addPluginLoadErrorStatus({ error, packageName, version, debug })
    throw error
  }
}
