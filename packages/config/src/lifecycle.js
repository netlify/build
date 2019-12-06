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

module.exports = { LIFECYCLE }
