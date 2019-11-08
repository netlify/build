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
   * `finally` - Runs after anything else
   */
  'finally',
  // Todo onError is not part of lifecycle. Its a special handler
  'onError',
]

module.exports = { LIFECYCLE }
