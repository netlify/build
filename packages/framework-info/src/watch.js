// Retrieve framework's watch commands.
// We use, in priority order:
//   - `package.json` `scripts` containing `framework.watchCommand`
//   - `package.json` `scripts` whose names are among `NPM_WATCH_SCRIPTS`
//   - `framework.watchCommand`
const getWatchCommands = function({ frameworkWatchCommand, scripts, runScriptCommand }) {
  const scriptWatchCommands = getScriptWatchCommands(scripts, frameworkWatchCommand).map(
    scriptName => `${runScriptCommand} ${scriptName}`
  )
  if (scriptWatchCommands.length !== 0) {
    return scriptWatchCommands
  }

  return [frameworkWatchCommand]
}

const getScriptWatchCommands = function(scripts, frameworkWatchCommand) {
  const preferredScripts = getPreferredScripts(scripts, frameworkWatchCommand)
  if (preferredScripts.length !== 0) {
    return preferredScripts
  }

  return Object.keys(scripts).filter(isNpmWatchScript)
}

const getPreferredScripts = function(scripts, frameworkWatchCommand) {
  return Object.entries(scripts)
    .filter(([, scriptValue]) => scriptValue.includes(frameworkWatchCommand))
    .map(getEntryKey)
}

const getEntryKey = function([key]) {
  return key
}

// Check if the npm script is likely to contain a watch command
const isNpmWatchScript = function(scriptName) {
  return NPM_WATCH_SCRIPTS.some(watchScriptName => matchesNpmWatchScript(scriptName, watchScriptName))
}

// We also match script names like `docs:dev`
const matchesNpmWatchScript = function(scriptName, watchScriptName) {
  return scriptName === watchScriptName || scriptName.endsWith(`:${watchScriptName}`)
}

const NPM_WATCH_SCRIPTS = ['serve', 'dev', 'develop', 'start', 'run', 'build', 'web']

module.exports = { getWatchCommands }
