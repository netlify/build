// Retrieve framework's dev commands.
// We use, in priority order:
//   - `package.json` `scripts` containing `framework.dev.command`
//   - `package.json` `scripts` whose names are among `NPM_DEV_SCRIPTS`
//   - `framework.dev.command`
export const getDevCommands = function ({
  frameworkDevCommand,
  scripts,
  runScriptCommand,
}: {
  frameworkDevCommand?: string
  scripts: Record<string, string>
  runScriptCommand: string
}): string[] {
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

const getScriptDevCommands = function (scripts: Record<string, string>, frameworkDevCommand: string): string[] {
  const preferredScripts = getPreferredScripts(scripts, frameworkDevCommand)
  if (preferredScripts.length !== 0) {
    return preferredScripts
  }

  const devScripts = Object.keys(scripts).filter((script) => isNpmDevScript(script, scripts[script]))
  return devScripts.sort(scriptsSorter)
}

const getSortIndex = (index: number): number => (index === -1 ? Number.MAX_SAFE_INTEGER : index)

const scriptsSorter = (script1: string, script2: string): number => {
  const index1 = NPM_DEV_SCRIPTS.findIndex((devScriptName) => matchesNpmWDevScript(script1, devScriptName))
  const index2 = NPM_DEV_SCRIPTS.findIndex((devScriptName) => matchesNpmWDevScript(script2, devScriptName))

  return getSortIndex(index1) - getSortIndex(index2)
}

const getPreferredScripts = function (scripts: Record<string, string>, frameworkDevCommand: string): string[] {
  return Object.entries(scripts)
    .filter(([, scriptValue]) => scriptValue.includes(frameworkDevCommand))
    .map(([key]) => key)
    .sort(scriptsSorter)
}

// Check if the npm script is likely to contain a dev command
const isNpmDevScript = function (scriptName: string, scriptValue: string): boolean {
  return NPM_DEV_SCRIPTS.some(
    (devScriptName) => matchesNpmWDevScript(scriptName, devScriptName) && !isExcludedScript(scriptValue),
  )
}

// We also match script names like `docs:dev`
const matchesNpmWDevScript = function (scriptName: string, devScriptName: string): boolean {
  return scriptName === devScriptName || scriptName.endsWith(`:${devScriptName}`)
}

const NPM_DEV_SCRIPTS = ['dev', 'serve', 'develop', 'start', 'run', 'build', 'web']

const isExcludedScript = function (scriptValue: string): boolean {
  return EXCLUDED_SCRIPTS.some((excluded) => scriptValue.includes(excluded))
}

const EXCLUDED_SCRIPTS = ['netlify dev']
