// Any plugin event handler `name:...` overrides any previous event
// handler `...` of the plugin `name`
const getOverride = function(originalEvent) {
  if (!originalEvent.includes(':')) {
    return {}
  }

  const [name, ...parts] = originalEvent.split(':')
  const event = parts.join(':')
  return { name, event }
}

// Remove plugin commands that are overriden by an event handler called `name:...`
const isNotOverridden = function(pluginCommand, index, pluginCommands) {
  return !pluginCommands.some(
    ({ override: { event, name } }, indexA) =>
      index !== indexA && event === pluginCommand.event && name === pluginCommand.name,
  )
}

module.exports = { getOverride, isNotOverridden }
