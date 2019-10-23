// Any plugin hook `name:...` overrides any previous hook `...` of the plugin `name`
const getOverride = function(hookName) {
  if (!hookName.includes(':')) {
    return {}
  }

  const [name, ...parts] = hookName.split(':')
  const hook = parts.join(':')
  return { name, hook }
}

// Remove plugin hooks that are overriden by a hook called `name:...`
const isNotOverridden = function(pluginHook, index, pluginHooks) {
  return !pluginHooks.some(
    ({ override: { hook, name } }, indexA) => index !== indexA && hook === pluginHook.hook && name === pluginHook.name,
  )
}

module.exports = { getOverride, isNotOverridden }
