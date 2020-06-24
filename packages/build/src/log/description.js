// Retrieve description of `build.command` or of an event handler
const getCommandDescription = function({ event, buildCommandOrigin, package }) {
  if (buildCommandOrigin !== undefined) {
    return getBuildCommandDescription(buildCommandOrigin)
  }

  return `${event} command from ${package}`
}

// Retrieve description of `build.command`
const getBuildCommandDescription = function(buildCommandOrigin) {
  return BUILD_COMMAND_DESCRIPTIONS[buildCommandOrigin]
}

const BUILD_COMMAND_DESCRIPTIONS = {
  ui: 'Build command from Netlify app',
  config: 'build.command from netlify.toml',
}

// Retrieve human-friendly plugin origin
const getPluginOrigin = function(loadedFrom, origin) {
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

module.exports = { getCommandDescription, getBuildCommandDescription, getPluginOrigin }
