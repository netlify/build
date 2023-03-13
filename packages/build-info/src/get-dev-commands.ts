/** A list of commonly used dev scripts */
const COMMON_DEV_SCRIPTS = ['dev', 'serve', 'develop', 'start', 'run', 'build', 'web']
const EXCLUDED_SCRIPTS = ['netlify dev']

/** Check if the provided script is excluded or not */
const isExcludedScript = (scriptValue: string) => EXCLUDED_SCRIPTS.some((excluded) => scriptValue.includes(excluded))

/** We also match script names like `docs:dev` */
const isDevScript = (scriptName: string, devScriptName: string) =>
  scriptName === devScriptName || scriptName.endsWith(`:${devScriptName}`)

const getSortIndex = (index: number): number => (index === -1 ? Number.MAX_SAFE_INTEGER : index)

const sortByRelevance = (script1: string, script2: string): number => {
  const index1 = COMMON_DEV_SCRIPTS.findIndex((devScriptName) => isDevScript(script1, devScriptName))
  const index2 = COMMON_DEV_SCRIPTS.findIndex((devScriptName) => isDevScript(script2, devScriptName))

  return getSortIndex(index1) - getSortIndex(index2)
}

/** Check if the npm script is likely to contain a dev command */
const isNpmDevScript = (scriptName: string, scriptValue: string) =>
  COMMON_DEV_SCRIPTS.some((devScriptName) => isDevScript(scriptName, devScriptName) && !isExcludedScript(scriptValue))

/** Retrieve a list of NPM scripts */
export function getDevCommands(frameworkDevCommand: string, scripts: Record<string, string> = {}): string[] {
  const preferredScripts = Object.entries(scripts)
    .filter(([, scriptValue]) => scriptValue.includes(frameworkDevCommand))
    .map(([key]) => key)
    .sort(sortByRelevance)

  if (preferredScripts.length > 0) {
    return preferredScripts
  }

  return Object.keys(scripts)
    .filter((script) => isNpmDevScript(script, scripts[script]))
    .sort(sortByRelevance)
}
