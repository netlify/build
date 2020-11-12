'use strict'

const { execPath } = require('process')

const execa = require('execa')

const { addErrorInfo } = require('../error/info')
const { logLoadingPlugins } = require('../log/messages/plugins')
const { measureDuration } = require('../time/main')

const { getEventFromChild } = require('./ipc')
const { getUserNodeVersion, getCurrentNodeVersion, checkNodeVersion } = require('./node_version')
const { getSpawnInfo } = require('./options')

const CHILD_MAIN_FILE = `${__dirname}/child/main.js`

// Start child processes used by all plugins
// We fire plugins through child processes so that:
//  - each plugin is sandboxed, e.g. cannot access/modify its parent `process`
//    (for both security and safety reasons)
//  - logs can be buffered which allows manipulating them for log shipping,
//    transforming and parallel plugins
const tStartPlugins = async function ({ pluginsOptions, buildDir, nodePath, childEnv, mode, logs }) {
  logLoadingPlugins(logs, pluginsOptions)

  const userNodeVersion = await getUserNodeVersion(nodePath)
  const childProcesses = await Promise.all(
    pluginsOptions.map(({ packageName, pluginPackageJson, loadedFrom, pluginDir }) =>
      startPlugin({
        buildDir,
        nodePath,
        childEnv,
        packageName,
        pluginPackageJson,
        loadedFrom,
        pluginDir,
        mode,
        userNodeVersion,
      }),
    ),
  )
  return { childProcesses }
}

const startPlugins = measureDuration(tStartPlugins, 'start_plugins')

const startPlugin = async function ({
  buildDir,
  nodePath,
  childEnv,
  packageName,
  pluginPackageJson,
  loadedFrom,
  pluginDir,
  mode,
  userNodeVersion,
}) {
  const { childNodePath, childNodeVersion } = getChildNodePath({ loadedFrom, nodePath, userNodeVersion, mode })

  checkNodeVersion({ childNodeVersion, packageName, pluginPackageJson })

  const childProcess = execa.node(CHILD_MAIN_FILE, {
    cwd: buildDir,
    preferLocal: true,
    localDir: pluginDir,
    nodePath: childNodePath,
    execPath: childNodePath,
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

// Local plugins, `package.json`-installed plugins and local builds use user's
// preferred Node.js version.
// Other plugins use `@netlify/build` Node.js version.
const getChildNodePath = function ({ loadedFrom, nodePath, userNodeVersion, mode }) {
  if (loadedFrom === 'local' || loadedFrom === 'package.json' || (loadedFrom !== 'core' && mode !== 'buildbot')) {
    return { childNodePath: nodePath, childNodeVersion: userNodeVersion }
  }

  return { childNodePath: execPath, childNodeVersion: getCurrentNodeVersion() }
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
