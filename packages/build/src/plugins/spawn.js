const { execPath } = require('process')

const execa = require('execa')

const { logLoadingPlugins } = require('../log/main')
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
const tStartPlugins = async function({ pluginsOptions, buildDir, nodePath, childEnv, mode, logs }) {
  logLoadingPlugins(logs, pluginsOptions)

  const spawnInfo = getSpawnInfo()
  const userNodeVersion = await getUserNodeVersion(nodePath)
  const childProcesses = await Promise.all(
    pluginsOptions.map(({ package, pluginPackageJson, loadedFrom, pluginDir }) =>
      startPlugin({
        buildDir,
        nodePath,
        childEnv,
        package,
        pluginPackageJson,
        loadedFrom,
        pluginDir,
        mode,
        spawnInfo,
        userNodeVersion,
      }),
    ),
  )
  return { childProcesses }
}

const startPlugins = measureDuration(tStartPlugins, 'start_plugins')

const startPlugin = async function({
  buildDir,
  nodePath,
  childEnv,
  package,
  pluginPackageJson,
  loadedFrom,
  pluginDir,
  mode,
  spawnInfo,
  userNodeVersion,
}) {
  const { childNodePath, childNodeVersion } = getChildNodePath({ loadedFrom, nodePath, userNodeVersion, mode })

  await checkNodeVersion({ childNodeVersion, package, pluginPackageJson })

  const childProcess = execa.node(CHILD_MAIN_FILE, {
    cwd: buildDir,
    preferLocal: true,
    localDir: pluginDir,
    nodePath: childNodePath,
    execPath: childNodePath,
    env: childEnv,
    extendEnv: false,
  })
  await getEventFromChild(childProcess, 'ready', spawnInfo)
  return { childProcess }
}

// Local plugins, `package.json`-installed plugins and local builds use user's
// preferred Node.js version.
// Other plugins use `@netlify/build` Node.js version.
const getChildNodePath = function({ loadedFrom, nodePath, userNodeVersion, mode }) {
  if (loadedFrom === 'local' || loadedFrom === 'package.json' || (loadedFrom !== 'core' && mode !== 'buildbot')) {
    return { childNodePath: nodePath, childNodeVersion: userNodeVersion }
  }

  return { childNodePath: execPath, childNodeVersion: getCurrentNodeVersion() }
}

// Stop all plugins child processes
const stopPlugins = async function(childProcesses) {
  await Promise.all(childProcesses.map(stopPlugin))
}

const stopPlugin = async function({ childProcess }) {
  if (childProcess.connected) {
    childProcess.disconnect()
  }

  childProcess.kill()
}

module.exports = { startPlugins, stopPlugins }
