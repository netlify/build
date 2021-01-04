// Retrieve framework's watch commands.
// We use, in priority order:
//   - `package.json` `scripts` containing `framework.watch.command`
//   - `package.json` `scripts` whose names are among `NPM_WATCH_SCRIPTS`
//   - `framework.watch.command`
const getWatchCommands = function ({ frameworkWatchCommand, scripts, runScriptCommand }) {
  const scriptWatchCommands = getScriptWatchCommands(scripts, frameworkWatchCommand).map(
    (scriptName) => `${runScriptCommand} ${scriptName}`,
  )
  if (scriptWatchCommands.length !== 0) {
    return scriptWatchCommands
  }

  return [frameworkWatchCommand]
}

const getScriptWatchCommands = function (scripts, frameworkWatchCommand) {
  const preferredScripts = getPreferredScripts(scripts, frameworkWatchCommand)
  if (preferredScripts.length !== 0) {
    return preferredScripts
  }

  const watchScripts = Object.keys(scripts).filter((script) => isNpmWatchScript(script))
  // eslint-disable-next-line fp/no-mutating-methods
  return watchScripts.sort(scriptsSorter)
}

const scriptsSorter = (script1, script2) => {
  const index1 = NPM_WATCH_SCRIPTS.findIndex((watchScriptName) => matchesNpmWatchScript(script1, watchScriptName))
  const index2 = NPM_WATCH_SCRIPTS.findIndex((watchScriptName) => matchesNpmWatchScript(script2, watchScriptName))

  return index1 - index2
}

const getPreferredScripts = function (scripts, frameworkWatchCommand) {
  return Object.entries(scripts)
    .filter(([, scriptValue]) => scriptValue.includes(frameworkWatchCommand))
    .map((script) => getEntryKey(script))
}

const getEntryKey = function ([key]) {
  return key
}

// Check if the npm script is likely to contain a watch command
const isNpmWatchScript = function (scriptName) {
  return NPM_WATCH_SCRIPTS.some((watchScriptName) => matchesNpmWatchScript(scriptName, watchScriptName))
}

// We also match script names like `docs:dev`
const matchesNpmWatchScript = function (scriptName, watchScriptName) {
  return scriptName === watchScriptName || scriptName.endsWith(`:${watchScriptName}`)
}

const NPM_WATCH_SCRIPTS = ['serve', 'dev', 'develop', 'start', 'run', 'build', 'web']

module.exports = { getWatchCommands }
