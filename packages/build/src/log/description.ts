export const getBuildCommandDescription = function (buildCommandOrigin: string | undefined): string | undefined {
  return buildCommandOrigin === undefined ? undefined : BUILD_COMMAND_DESCRIPTIONS[buildCommandOrigin]
}

const BUILD_COMMAND_DESCRIPTIONS: Partial<Record<string, string>> = {
  ui: 'Build command from Netlify app',
  config: 'build.command from netlify.toml',
  inline: 'build.command from a plugin',
  heuristics: 'build.command automatically detected',
}

/** Retrieve human-friendly plugin origin */
export const getPluginOrigin = function (loadedFrom: string, origin: string) {
  const originName = PLUGIN_ORIGINS[origin]

  if (loadedFrom === 'package.json') {
    return `from ${String(originName)} and package.json`
  }

  return `from ${String(originName)}`
}

const PLUGIN_ORIGINS: Partial<Record<string, string>> = {
  core: 'core',
  ui: 'Netlify app',
  config: 'netlify.toml',
}
