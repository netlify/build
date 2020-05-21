const { basename } = require('path')

// Retrieve description of `build.command` or of an event handler
const getCommandDescription = function({ event, package, configPath }) {
  if (package === undefined) {
    return getBuildCommandDescription(configPath)
  }

  return `${event} command from ${package}`
}

// Retrieve description of `build.command`
const getBuildCommandDescription = function(configPath) {
  if (configPath === undefined) {
    return `Build command from settings`
  }

  return `build.command from ${basename(configPath)}`
}

// Retrieve human-friendly plugin origin
const getPluginOrigin = function(loadedFrom, origin) {
  const originName = ORIGINS[origin]

  if (loadedFrom === 'package.json') {
    return `from ${originName} and package.json`
  }

  return `from ${originName}`
}

const ORIGINS = {
  core: 'core',
  ui: 'Netlify app',
  config: 'netlify.toml',
}

module.exports = { getCommandDescription, getBuildCommandDescription, getPluginOrigin }
