export const getBuildCommandDescription = function (buildCommandOrigin) {
  return BUILD_COMMAND_DESCRIPTIONS[buildCommandOrigin]
}

const BUILD_COMMAND_DESCRIPTIONS = {
  ui: 'Build command from Netlify app',
  config: 'build.command from netlify.toml',
  inline: 'build.command from a plugin',
}

// Retrieve human-friendly plugin origin
export const getPluginOrigin = function (loadedFrom, origin) {
  const originName = PLUGIN_ORIGINS[origin]

  if (loadedFrom === 'package.json') {
    return `from ${originName} and package.json`
  }

  return `from ${originName}`
}

const PLUGIN_ORIGINS = {
  core: 'core',
  ui: 'Netlify app',
  config: 'netlify.toml',
}
