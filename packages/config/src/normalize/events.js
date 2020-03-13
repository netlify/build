const EVENTS = [
  /**
   * `onInit` - Runs before anything else
   */
  'onInit',

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

const LEGACY_EVENTS = {
  // TODO: remove after going out of beta
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
  prePackage: 'onPreFunctionsPackage',
  package: 'onFunctionsPackage',
  postPackage: 'onPostFunctionsPackage',
  preDeploy: 'onPreDeploy',
  preSaveCache: 'onPreSaveCache',
  saveCache: 'onSaveCache',
  postSaveCache: 'onPostSaveCache',
  success: 'onSuccess',
  error: 'onError',
  end: 'onEnd',
  finally: 'onEnd',

  // TODO: those are temporarily disabled until we implement them
  onPreGetCache: 'onPreBuild',
  onGetCache: 'onPreBuild',
  onPostGetCache: 'onPreBuild',
  onPreInstall: 'onPreBuild',
  onInstall: 'onPreBuild',
  onPostInstall: 'onPreBuild',
  onPreFunctionsBuild: 'onPostBuild',
  onFunctionsBuild: 'onPostBuild',
  onPostFunctionsBuild: 'onPostBuild',
  onPreFunctionsPackage: 'onPostBuild',
  onFunctionsPackage: 'onPostBuild',
  onPostFunctionsPackage: 'onPostBuild',
  onPreDeploy: 'onPostBuild',
  onPreSaveCache: 'onPostBuild',
  onSaveCache: 'onPostBuild',
  onPostSaveCache: 'onPostBuild',
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
