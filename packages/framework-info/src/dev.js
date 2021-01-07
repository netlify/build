// Retrieve framework's dev commands.
// We use, in priority order:
//   - `package.json` `scripts` containing `framework.dev.command`
//   - `package.json` `scripts` whose names are among `NPM_DEV_SCRIPTS`
//   - `framework.dev.command`
const getDevCommands = function ({ frameworkDevCommand, scripts, runScriptCommand }) {
  if (frameworkDevCommand === undefined) {
    return []
  }
  const scriptDevCommands = getScriptDevCommands(scripts, frameworkDevCommand).map(
    (scriptName) => `${runScriptCommand} ${scriptName}`,
  )
  if (scriptDevCommands.length !== 0) {
    return scriptDevCommands
  }

  return [frameworkDevCommand]
}

const getScriptDevCommands = function (scripts, frameworkDevCommand) {
  const preferredScripts = getPreferredScripts(scripts, frameworkDevCommand)
  if (preferredScripts.length !== 0) {
    return preferredScripts
  }

  const devScripts = Object.keys(scripts).filter((script) => isNpmDevScript(script))
  // eslint-disable-next-line fp/no-mutating-methods
  return devScripts.sort(scriptsSorter)
}

const getSortIndex = (index) => (index === -1 ? Number.MAX_SAFE_INTEGER : index)

const scriptsSorter = (script1, script2) => {
  const index1 = NPM_DEV_SCRIPTS.findIndex((devScriptName) => matchesNpmWDevScript(script1, devScriptName))
  const index2 = NPM_DEV_SCRIPTS.findIndex((devScriptName) => matchesNpmWDevScript(script2, devScriptName))

  return getSortIndex(index1) - getSortIndex(index2)
}

const getPreferredScripts = function (scripts, frameworkDevCommand) {
  // eslint-disable-next-line fp/no-mutating-methods
  return Object.entries(scripts)
    .filter(([, scriptValue]) => scriptValue.includes(frameworkDevCommand))
    .map((script) => getEntryKey(script))
    .sort(scriptsSorter)
}

const getEntryKey = function ([key]) {
  return key
}

// Check if the npm script is likely to contain a dev command
const isNpmDevScript = function (scriptName) {
  return NPM_DEV_SCRIPTS.some((devScriptName) => matchesNpmWDevScript(scriptName, devScriptName))
}

// We also match script names like `docs:dev`
const matchesNpmWDevScript = function (scriptName, devScriptName) {
  return scriptName === devScriptName || scriptName.endsWith(`:${devScriptName}`)
}

const NPM_DEV_SCRIPTS = ['serve', 'dev', 'develop', 'start', 'run', 'build', 'web']

module.exports = { getDevCommands }
