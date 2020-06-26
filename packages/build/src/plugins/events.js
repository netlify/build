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
]

module.exports = { EVENTS }
