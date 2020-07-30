// Retrieve framework's watch commands.
// If the `package.json` has some `scripts` and it contains the watch command,
// it is used. A script is considered as containing the watch command if its
// name is among `framework.watchPackageScripts` or its value includes
// `framework.watchCommand`.
// Otherwise, `framework.watchCommand` is the default value.
const getWatchCommands = function({ frameworkWatchCommand, frameworkWatchScripts, scripts, runScriptCommand }) {
  const watchCommands = getScriptWatchCommands({
    frameworkWatchCommand,
    frameworkWatchScripts,
    scripts,
    runScriptCommand
  })
  if (watchCommands.length === 0) {
    return [frameworkWatchCommand]
  }
  return watchCommands
}

const getScriptWatchCommands = function({ frameworkWatchCommand, frameworkWatchScripts, scripts, runScriptCommand }) {
  return Object.entries(scripts)
    .filter(([scriptName, scriptValue]) =>
      isFrameworkScript({ scriptName, scriptValue, frameworkWatchCommand, frameworkWatchScripts })
    )
    .map(([scriptName]) => `${runScriptCommand} ${scriptName}`)
}

const isFrameworkScript = function({ scriptName, scriptValue, frameworkWatchCommand, frameworkWatchScripts }) {
  return frameworkWatchScripts.includes(scriptName) || scriptValue.includes(frameworkWatchCommand)
}

module.exports = { getWatchCommands }
