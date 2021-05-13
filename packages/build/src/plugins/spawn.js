'use strict'

const execa = require('execa')

const { addErrorInfo } = require('../error/info')
const { logLoadingPlugins, logOutdatedPlugins, logIncompatiblePlugins } = require('../log/messages/compatibility')
const { measureDuration } = require('../time/main')

const { getEventFromChild } = require('./ipc')
const { getSpawnInfo } = require('./options')

const CHILD_MAIN_FILE = `${__dirname}/child/main.js`

// Start child processes used by all plugins
// We fire plugins through child processes so that:
//  - each plugin is sandboxed, e.g. cannot access/modify its parent `process`
//    (for both security and safety reasons)
//  - logs can be buffered which allows manipulating them for log shipping,
//    transforming and parallel plugins
const tStartPlugins = async function ({ pluginsOptions, buildDir, childEnv, logs, debug }) {
  logLoadingPlugins(logs, pluginsOptions, debug)
  logOutdatedPlugins(logs, pluginsOptions)
  logIncompatiblePlugins(logs, pluginsOptions)

  const childProcesses = await Promise.all(
    pluginsOptions.map(({ pluginDir, nodePath }) => startPlugin({ pluginDir, nodePath, buildDir, childEnv })),
  )
  return { childProcesses }
}

const startPlugins = measureDuration(tStartPlugins, 'start_plugins')

const startPlugin = async function ({ pluginDir, nodePath, buildDir, childEnv }) {
  const childProcess = execa.node(CHILD_MAIN_FILE, {
    cwd: buildDir,
    preferLocal: true,
    localDir: pluginDir,
    nodePath,
    execPath: nodePath,
    env: childEnv,
    extendEnv: false,
  })

  try {
    await getEventFromChild(childProcess, 'ready')
    return { childProcess }
  } catch (error) {
    const spawnInfo = getSpawnInfo()
    addErrorInfo(error, spawnInfo)
    throw error
  }
}

// Stop all plugins child processes
const stopPlugins = function (childProcesses) {
  childProcesses.forEach(stopPlugin)
}

const stopPlugin = function ({ childProcess }) {
  if (childProcess.connected) {
    childProcess.disconnect()
  }

  childProcess.kill()
}

module.exports = { startPlugins, stopPlugins }
