const EVENTS = [
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
   * `onPreBuild` - Before build commands are executed
   */
  'onPreBuild',
  /**
   * `onBuild` - Build commands are executed
   */
  'onBuild',
  /**
   * `onPostBuild` - After Build commands are executed
   */
  'onPostBuild',
  /**
   * `onFunctionsBuild` - Build functions
   */
  'onPreFunctionsBuild',
  'onFunctionsBuild',
  'onPostFunctionsBuild',
  /**
   * `onFunctionsPackage` - Package the serverless functions
   */
  'onPreFunctionsPackage',
  'onFunctionsPackage',
  'onPostFunctionsPackage',
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
const LEGACY_EVENTS = {
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
  preFunctionsPackage: 'onPreFunctionsPackage',
  functionsPackage: 'onFunctionsPackage',
  postFunctionsPackage: 'onPostFunctionsPackage',
  preDeploy: 'onPreDeploy',
  preSaveCache: 'onPreSaveCache',
  saveCache: 'onSaveCache',
  postSaveCache: 'onPostSaveCache',
  success: 'onSuccess',
  error: 'onError',
  end: 'onEnd',
  finally: 'onEnd',
}

// `build.lifecycle.onEvent` can also be spelled `build.lifecycle.onevent`
const normalizeEventHandler = function(eventHandler) {
  const normalizedEventHandler = EVENT_HANDLER_CASES[eventHandler.toLowerCase()]
  if (normalizedEventHandler === undefined) {
    return eventHandler
  }

  return normalizedEventHandler
}

const getEventHandlerCases = function() {
  const events = [...EVENTS, ...Object.keys(LEGACY_EVENTS)].map(getEventHandlerCase)
  return Object.assign({}, ...events)
}

const getEventHandlerCase = function(event) {
  return { [event.toLowerCase()]: event }
}

const EVENT_HANDLER_CASES = getEventHandlerCases()

module.exports = { EVENTS, LEGACY_EVENTS, normalizeEventHandler }
