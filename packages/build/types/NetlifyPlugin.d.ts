import { NetlifyEvent } from './NetlifyEvent'

export interface NetlifyPlugin {
  /**
   * Runs before the build command is executed.
   */
  onPreBuild?: NetlifyEvent
  /**
   * runs directly after the build command is executed and before Functions? bundling and Edge Handlers bundling.
   */
  onBuild?: NetlifyEvent
  /**
   * runs after the build command completes; after onBuild? tasks, Functions? bundling, and Edge Handlers bundling are executed; and before the deploy stage. Can be used to prevent a build from being deployed.
   */
  onPostBuild?: NetlifyEvent
  /**
   * runs when an error occurs in the build or deploy stage, failing the build. Can’t be used to prevent a build from being deployed.
   */
  onError?: NetlifyEvent
  /**
   * runs when the deploy succeeds. Can’t be used to prevent a build from being deployed.
   */
  onSuccess?: NetlifyEvent
  /**
   * runs after completion of the deploy stage, regardless of build error or success; is useful for resources cleanup. Can’t be used to prevent a build from being deployed.
   */
  onEnd?: NetlifyEvent
}
