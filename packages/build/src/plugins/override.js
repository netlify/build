// Any plugin hook `type:...` overrides any previous hook `...` of the plugin `type`
const getOverride = function(hookName) {
  if (!hookName.includes(':')) {
    return {}
  }

  const [type, ...parts] = hookName.split(':')
  const hook = parts.join(':')
  return { type, hook }
}

// Remove plugin hooks that are overriden by a hook called `type:...`
const isNotOverridden = function(lifeCycleHook, index, lifeCycleHooks) {
  return !lifeCycleHooks.some(
    ({ override: { hook, type } }, indexA) =>
      index !== indexA && hook === lifeCycleHook.hook && type === lifeCycleHook.type
  )
}

module.exports = { getOverride, isNotOverridden }
