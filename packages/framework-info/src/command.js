// Retrieve framework's build command.
// If the `package.json` has some `scripts` and it contains the build command,
// it is used. A script is considered as containing the build command if its
// name is among `framework.packageScripts` or its value includes
// `framework.command`.
// Otherwise, `framework.command` is the default value.
const getCommand = function({ frameworkCommand, frameworkScripts, scripts, runScriptCommand }) {
  const scriptCommands = getScriptCommands({ frameworkCommand, frameworkScripts, scripts, runScriptCommand })
  if (scriptCommands.length === 0) {
    return [frameworkCommand]
  }
  return scriptCommands
}

const getScriptCommands = function({ frameworkCommand, frameworkScripts, scripts, runScriptCommand }) {
  return Object.entries(scripts)
    .filter(([scriptName, scriptCommand]) =>
      isFrameworkScript({ scriptName, scriptCommand, frameworkCommand, frameworkScripts })
    )
    .map(([scriptName]) => `${runScriptCommand} ${scriptName}`)
}

const isFrameworkScript = function({ scriptName, scriptCommand, frameworkCommand, frameworkScripts }) {
  return frameworkScripts.includes(scriptName) || scriptCommand.includes(frameworkCommand)
}

module.exports = { getCommand }
