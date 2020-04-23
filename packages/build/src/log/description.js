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

module.exports = { getCommandDescription, getBuildCommandDescription }
