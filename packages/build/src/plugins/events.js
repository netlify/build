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

// TODO: remove after going out of beta
const LEGACY_EVENTS = {
  init: 'onInit',
  preBuild: 'onPreBuild',
  preGetCache: 'onPreBuild',
  onPreGetCache: 'onPreBuild',
  getCache: 'onPreBuild',
  onGetCache: 'onPreBuild',
  postGetCache: 'onPreBuild',
  onPostGetCache: 'onPreBuild',
  preInstall: 'onPreBuild',
  onPreInstall: 'onPreBuild',
  install: 'onPreBuild',
  onInstall: 'onPreBuild',
  postInstall: 'onPreBuild',
  onPostInstall: 'onPreBuild',
  build: 'onBuild',
  postBuild: 'onPostBuild',
  preFunctionsBuild: 'onPostBuild',
  onPreFunctionsBuild: 'onPostBuild',
  functionsBuild: 'onPostBuild',
  onFunctionsBuild: 'onPostBuild',
  postFunctionsBuild: 'onPostBuild',
  onPostFunctionsBuild: 'onPostBuild',
  preFunctionsPackage: 'onPostBuild',
  onPreFunctionsPackage: 'onPostBuild',
  functionsPackage: 'onPostBuild',
  onFunctionsPackage: 'onPostBuild',
  postFunctionsPackage: 'onPostBuild',
  onPostFunctionsPackage: 'onPostBuild',
  prePackage: 'onPostBuild',
  package: 'onPostBuild',
  postPackage: 'onPostBuild',
  preDeploy: 'onPostBuild',
  onPreDeploy: 'onPostBuild',
  preSaveCache: 'onPostBuild',
  onPreSaveCache: 'onPostBuild',
  saveCache: 'onPostBuild',
  onSaveCache: 'onPostBuild',
  postSaveCache: 'onPostBuild',
  onPostSaveCache: 'onPostBuild',
  success: 'onSuccess',
  error: 'onError',
  end: 'onEnd',
  finally: 'onEnd',
}

module.exports = { EVENTS, LEGACY_EVENTS }
