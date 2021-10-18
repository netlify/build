import { PluginInputs } from './config/inputs'
import { NetlifyEvent } from './netlify_event'
import { NetlifyPluginOptions } from './netlify_plugin_options'

export interface NetlifyPlugin<
  TInputs extends PluginInputs = PluginInputs,
  TPluginOptions extends NetlifyPluginOptions = NetlifyPluginOptions<TInputs>,
> {
  /**
   * Runs before the build command is executed.
   */
  onPreBuild?: NetlifyEvent<TInputs, TPluginOptions>
  /**
   * runs directly after the build command is executed and before Functions? bundling and Edge Handlers bundling.
   */
  onBuild?: NetlifyEvent<TInputs, TPluginOptions>
  /**
   * runs after the build command completes; after onBuild? tasks, Functions? bundling, and Edge Handlers bundling are executed; and before the deploy stage. Can be used to prevent a build from being deployed.
   */
  onPostBuild?: NetlifyEvent<TInputs, TPluginOptions>
  /**
   * runs when an error occurs in the build or deploy stage, failing the build. Can’t be used to prevent a build from being deployed.
   */
  onError?: NetlifyEvent<TInputs, TPluginOptions & { error: Error }>
  /**
   * runs when the deploy succeeds. Can’t be used to prevent a build from being deployed.
   */
  onSuccess?: NetlifyEvent<TInputs, TPluginOptions>
  /**
   * runs after completion of the deploy stage, regardless of build error or success; is useful for resources cleanup. Can’t be used to prevent a build from being deployed.
   */
  onEnd?: NetlifyEvent<TInputs, TPluginOptions & { error?: Error }>
}
