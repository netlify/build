
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
   * `install` - Install project dependancies
   */
  'preInstall',
  'install',
  'postInstall',
  /**
   * `preBuild` - runs before functions & build commands run
   */
  'preBuild',
  /**
   * `functionsBuild` - build the serverless functions
   */
  'preFunctionsBuild',
  'functionsBuild',
  'postFunctionsBuild',
  /**
   * `build` - build commands run
   */
  'build',
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
   * `preDeploy` - Deploy built artifact
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
  'onError'
]

module.exports = { LIFECYCLE }
