const execa = require('execa')

const { getEventFromChild, sendEventToChild } = require('../ipc')

const CHILD_MAIN_FILE = `${__dirname}/../child/main.js`

// Start child processes used by all plugins
const startPlugins = async function(pluginsOptions, baseDir) {
  const childProcesses = await Promise.all(pluginsOptions.map(({ pluginId }) => startPlugin(pluginId, baseDir)))
  return Object.assign({}, ...childProcesses)
}

const startPlugin = async function(pluginId, baseDir) {
  // TODO: use `redactProcess` to redact secrets
  const childProcess = execa.node(CHILD_MAIN_FILE, { cwd: baseDir, stdio: 'inherit' })
  await getEventFromChild(childProcess, 'ready')
  return { [pluginId]: childProcess }
}

// Stop all plugins child processes
const stopPlugins = async function(childProcesses) {
  await Promise.all(Object.values(childProcesses).map(stopPlugin))
}

const stopPlugin = async function(childProcess) {
  if (childProcess.connected) {
    await sendEventToChild(childProcess, 'exit')
    childProcess.disconnect()
  }

  await childProcess
}

module.exports = { startPlugins, stopPlugins }
