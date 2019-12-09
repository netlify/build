const LIFECYCLE = [
  /**
   * `onInit` - Runs before anything else
   */
  'onInit',
  /**
   * `onGetCache` - Fetch previous build cache
   */
  'onPreGetCache',
  'onGetCache',
  'onPostGetCache',
  /**
   * `onInstall` - Install project dependencies
   */
  'onPreInstall',
  'onInstall',
  'onPostInstall',
  /**
   * `onBuild` - Build commands are executed
   */
  'onPreBuild',
  'onBuild',
  'onPostBuild',
  /**
   * `onFunctionsBuild` - Build the serverless functions
   */
  'onPreFunctionsBuild',
  'onFunctionsBuild',
  'onPostFunctionsBuild',
  /**
   * `onPackage` - Package & optimize artifact
   */
  'onPrePackage',
  'onPackage',
  'onPostPackage',
  /**
   * `onPreDeploy` - Runs before built artifacts are deployed
   */
  'onPreDeploy',
  // 'onDeploy', Not currently active
  // 'onPostDeploy', Not currently active
  /**
   * `onSaveCache` - Save cached assets
   */
  'onPreSaveCache',
  'onSaveCache',
  'onPostSaveCache',
  /**
   * `onSuccess` - Runs on build success
   */
  'onSuccess',
  /**
   * `onError` - Runs on build error
   */
  'onError',
  /**
   * `onEnd` - Runs on build error or success
   */
  'onEnd',
]

// TODO: remove after going out of beta
const LEGACY_LIFECYCLE = {
  init: 'onInit',
  preGetCache: 'onPreGetCache',
  getCache: 'onGetCache',
  postGetCache: 'onPostGetCache',
  preInstall: 'onPreInstall',
  install: 'onInstall',
  postInstall: 'onPostInstall',
  preBuild: 'onPreBuild',
  build: 'onBuild',
  postBuild: 'onPostBuild',
  preFunctionsBuild: 'onPreFunctionsBuild',
  functionsBuild: 'onFunctionsBuild',
  postFunctionsBuild: 'onPostFunctionsBuild',
  prePackage: 'onPrePackage',
  package: 'onPackage',
  postPackage: 'onPostPackage',
  preDeploy: 'onPreDeploy',
  preSaveCache: 'onPreSaveCache',
  saveCache: 'onSaveCache',
  postSaveCache: 'onPostSaveCache',
  success: 'onSuccess',
  error: 'onError',
  end: 'onEnd',
}

// `build.lifecycle.onEvent` can also be spelled `build.lifecycle.onevent`
const normalizeLifecycleCase = function(event) {
  const normalizedEvent = LIFECYCLE_CASES[event.toLowerCase()]
  if (normalizedEvent === undefined) {
    return event
  }

  return normalizedEvent
}

const getLifecycleCases = function() {
  const events = [...LIFECYCLE, ...Object.keys(LEGACY_LIFECYCLE)].map(getLifecycleCase)
  return Object.assign({}, ...events)
}

const getLifecycleCase = function(event) {
  return { [event.toLowerCase()]: event }
}

const LIFECYCLE_CASES = getLifecycleCases()

module.exports = { LIFECYCLE, LEGACY_LIFECYCLE, normalizeLifecycleCase }
