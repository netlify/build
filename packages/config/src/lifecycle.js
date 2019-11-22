const LIFECYCLE = [
  /**
   * `init` - Runs before anything else
   */
  'init',
  /**
   * `getCache` - Fetch previous build cache
   */
  'preGetCache',
  'getCache',
  'postGetCache',
  /**
   * `install` - Install project dependencies
   */
  'preInstall',
  'install',
  'postInstall',
  /**
   * `preBuild` - Runs before functions & build commands run
   */
  'preBuild',
  /**
   * `build` - Build commands are executed
   */
  'build',
  /**
   * `functionsBuild` - Build the serverless functions
   */
  'preFunctionsBuild',
  'functionsBuild',
  'postFunctionsBuild',
  /**
   * `postBuild` - Runs after site & functions have been built
   */
  'postBuild',
  /**
   * `package` - Package & optimize artifact
   */
  'prePackage',
  'package',
  'postPackage',
  /**
   * `preDeploy` - Runs before built artifacts are deployed
   */
  'preDeploy',

  // 'deploy', Not currently active
  // 'postDeploy', Not currently active
  /**
   * `saveCache` - Save cached assets
   */
  'preSaveCache',
  'saveCache',
  'postSaveCache',
  /**
   * `onSuccess` - Runs on build success
   */
  'onSuccess',
  /**
   * `onError` - Runs on build error
   */
  'onError',
  /**
   * `finally` - Runs on build error or success
   */
  'finally',
]

module.exports = { LIFECYCLE }
