const { execPath } = require('process')

const execa = require('execa')

const { logLoadingPlugins } = require('../log/main')

const { getEventFromChild } = require('./ipc')
const { getSpawnInfo } = require('./options')

const CHILD_MAIN_FILE = `${__dirname}/child/main.js`

// Start child processes used by all plugins
// We fire plugins through child processes so that:
//  - each plugin is sandboxed, e.g. cannot access/modify its parent `process`
//    (for both security and safety reasons)
//  - logs can be buffered which allows manipulating them for log shipping,
//    transforming and parallel plugins
const startPlugins = function({ pluginsOptions, buildDir, nodePath, childEnv, mode }) {
  logLoadingPlugins(pluginsOptions)

  const spawnInfo = getSpawnInfo()
  return Promise.all(
    pluginsOptions.map(({ loadedFrom }) => startPlugin({ buildDir, nodePath, childEnv, loadedFrom, mode, spawnInfo })),
  )
}

const startPlugin = async function({ buildDir, nodePath, childEnv, loadedFrom, mode, spawnInfo }) {
  const childNodePath = getChildNodePath({ loadedFrom, nodePath, mode })

  const childProcess = execa.node(CHILD_MAIN_FILE, {
    cwd: buildDir,
    preferLocal: true,
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
const getChildNodePath = function({ loadedFrom, nodePath, mode }) {
  if (loadedFrom === 'core') {
    return execPath
  }

  if (loadedFrom === 'local' || loadedFrom === 'package.json' || mode !== 'buildbot') {
    return nodePath
  }

  return execPath
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
