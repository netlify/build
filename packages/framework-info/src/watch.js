// Retrieve framework's watch commands.
// If the `package.json` has some `scripts` and it contains the watch command,
// it is used. A script is considered as containing the watch command if its
// name is among `NPM_WATCH_SCRIPTS` or its value includes
// `framework.watchCommand`.
// Otherwise, `framework.watchCommand` is the default value.
const getWatchCommands = function({ frameworkWatchCommand, scripts, runScriptCommand }) {
  const watchCommands = getScriptWatchCommands({ frameworkWatchCommand, scripts, runScriptCommand })
  if (watchCommands.length === 0) {
    return [frameworkWatchCommand]
  }
  return watchCommands
}

const getScriptWatchCommands = function({ frameworkWatchCommand, scripts, runScriptCommand }) {
  return Object.entries(scripts)
    .filter(([scriptName, scriptValue]) => isFrameworkScript({ scriptName, scriptValue, frameworkWatchCommand }))
    .map(([scriptName]) => `${runScriptCommand} ${scriptName}`)
}

const isFrameworkScript = function({ scriptName, scriptValue, frameworkWatchCommand }) {
  return isNpmWatchScript(scriptName) || scriptValue.includes(frameworkWatchCommand)
}

// Check if the npm script is likely to contain a watch command
const isNpmWatchScript = function(scriptName) {
  return NPM_WATCH_SCRIPTS.some(watchScriptName => matchesNpmWatchScript(scriptName, watchScriptName))
}

// We also match script names like `docs:dev`
const matchesNpmWatchScript = function(scriptName, watchScriptName) {
  return scriptName === watchScriptName || scriptName.endsWith(`:${watchScriptName}`)
}

// TODO: frameworkWatchCommand has priority
const NPM_WATCH_SCRIPTS = ['serve', 'dev', 'develop', 'start', 'run', 'build', 'web']

module.exports = { getWatchCommands }
