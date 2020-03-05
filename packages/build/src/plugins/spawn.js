const execa = require('execa')

const { getEventFromChild } = require('./ipc')

const CHILD_MAIN_FILE = `${__dirname}/child/main.js`

// Start child processes used by all plugins
// We fire plugins through child processes so that:
//  - each plugin is sandboxed, e.g. cannot access/modify its parent `process`
//    (for both security and safety reasons)
//  - logs can be buffered which allows manipulating them for log shipping,
//    secrets redacting and parallel plugins
const startPlugins = function({ pluginsOptions, buildDir, nodePath, childEnv }) {
  return Promise.all(pluginsOptions.map(() => startPlugin({ buildDir, nodePath, childEnv })))
}

const startPlugin = async function({ buildDir, nodePath, childEnv }) {
  const childProcess = execa.node(CHILD_MAIN_FILE, {
    cwd: buildDir,
    preferLocal: true,
    nodePath,
    execPath: nodePath,
    env: childEnv,
    extendEnv: false,
  })
  await getEventFromChild(childProcess, 'ready')
  return { childProcess }
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
