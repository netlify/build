/** A list of often used dev command names to identify if the command is a dev command */
export const NPM_DEV_SCRIPTS = ['dev', 'serve', 'develop', 'start', 'run', 'web']
const EXCLUDED_DEV_SCRIPTS = ['netlify dev']

/** A list of often used build command names to identify if the command is a build command */
export const NPM_BUILD_SCRIPTS = ['build']
const EXCLUDED_BUILD_SCRIPTS = ['netlify build']

/** Check if the provided dev script is excluded or not */
const isExcludedDevScript = (scriptValue: string) =>
  EXCLUDED_DEV_SCRIPTS.some((excluded) => scriptValue.includes(excluded))

/** Check if the provided build script is excluded or not */
const isExcludedBuildScript = (scriptValue: string) =>
  EXCLUDED_BUILD_SCRIPTS.some((excluded) => scriptValue.includes(excluded))

/** We also match script names like `docs:dev` */
const isScript = (scriptName: string, devScriptName: string) =>
  scriptName === devScriptName || scriptName.endsWith(`:${devScriptName}`)

const getSortIndex = (index: number): number => (index === -1 ? Number.MAX_SAFE_INTEGER : index)

const sortScriptsByRelevance =
  (scripts: string[]) =>
  (script1: string, script2: string): number => {
    const index1 = scripts.findIndex((devScriptName) => isScript(script1, devScriptName))
    const index2 = scripts.findIndex((devScriptName) => isScript(script2, devScriptName))

    return getSortIndex(index1) - getSortIndex(index2)
  }

/** Check if the npm script is likely to contain a dev command */
export const isNpmDevScript = (scriptName: string, scriptValue: string) =>
  NPM_DEV_SCRIPTS.some((devScriptName) => isScript(scriptName, devScriptName) && !isExcludedDevScript(scriptValue))

/** Check if the npm script is likely to contain a build command */
export const isNpmBuildScript = (scriptName: string, scriptValue: string) =>
  NPM_BUILD_SCRIPTS.some((devScriptName) => isScript(scriptName, devScriptName) && !isExcludedBuildScript(scriptValue))

/** Retrieve a list of NPM dev scripts */
export function getDevCommands(frameworkDevCommand: string, scripts: Record<string, string> = {}): string[] {
  const preferredScripts = Object.entries(scripts)
    .filter(([, scriptValue]) => scriptValue.includes(frameworkDevCommand))
    .map(([key]) => key)
    .sort(sortScriptsByRelevance(NPM_DEV_SCRIPTS))

  if (preferredScripts.length > 0) {
    return preferredScripts
  }

  return Object.keys(scripts)
    .filter((script) => isNpmDevScript(script, scripts[script]))
    .sort(sortScriptsByRelevance(NPM_DEV_SCRIPTS))
}

/** Retrieve a list of NPM build scripts */
export function getBuildCommands(frameworkBuildCommand: string, scripts: Record<string, string> = {}): string[] {
  const preferredScripts = Object.entries(scripts)
    .filter(([, scriptValue]) => scriptValue.includes(frameworkBuildCommand))
    .map(([key]) => key)
    .sort(sortScriptsByRelevance(NPM_BUILD_SCRIPTS))

  if (preferredScripts.length > 0) {
    return preferredScripts
  }

  return Object.keys(scripts)
    .filter((script) => isNpmBuildScript(script, scripts[script]))
    .sort(sortScriptsByRelevance(NPM_BUILD_SCRIPTS))
}
