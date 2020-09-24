// From `--featureFlags=a,b,c` to `{ a: true, b: true, c: true }`
const normalizeFeatureFlags = function({ featureFlags = '', ...rawFlags }) {
  const normalizedFeatureFlags = Object.assign(
    {},
    ...featureFlags
      .split(',')
      .filter(isNotEmpty)
      .map(getFeatureFlag),
  )
  return { ...rawFlags, featureFlags: normalizedFeatureFlags }
}

const isNotEmpty = function(name) {
  return name.trim() !== ''
}

const getFeatureFlag = function(name) {
  return { [name]: true }
}

const DEFAULT_FEATURE_FLAGS = {
  // When `true`, core plugins are run after user plugins instead of before
  runCorePluginsLast: false,
  // When `true`, errors in `onSuccess`, `onEnd` and `onError` happening after
  // deploy do not make the build fail. They only make the plugin fail.
  postDeployErrors: false,
}

module.exports = { normalizeFeatureFlags, DEFAULT_FEATURE_FLAGS }
