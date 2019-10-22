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
const isNotOverridden = function(lifeCycleHook, index, lifeCycleHooks) {
  return !lifeCycleHooks.some(
    ({ override: { hook, name } }, indexA) =>
      index !== indexA && hook === lifeCycleHook.hook && name === lifeCycleHook.name,
  )
}

module.exports = { getOverride, isNotOverridden }
