const EVENTS = [
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

  /**
   * `onDeploySuccess` - Runs on deploy error
   */
  'onDeploySuccess',
  /**
   * `onDeployError` - Runs on deploy error
   */
  'onDeployError',
  /**
   * `onDeployEnd` - Runs on deploy error or success
   */
  'onDeployEnd',
]

module.exports = { EVENTS }
