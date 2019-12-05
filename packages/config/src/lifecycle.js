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
   * `build` - Build commands are executed
   */
  'preBuild',
  'build',
  'postBuild',
  /**
   * `functionsBuild` - Build the serverless functions
   */
  'preFunctionsBuild',
  'functionsBuild',
  'postFunctionsBuild',
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
   * `success` - Runs on build success
   */
  'success',
  /**
   * `error` - Runs on build error
   */
  'error',
  /**
   * `end` - Runs on build error or success
   */
  'end',
]

module.exports = { LIFECYCLE }
