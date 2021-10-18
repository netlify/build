import { PluginInputs } from './config/inputs'
import { NetlifyPluginOptions } from './netlify_plugin_options'

export interface NetlifyEvent<
  TInputs extends PluginInputs = PluginInputs,
  TPluginOptions extends NetlifyPluginOptions = NetlifyPluginOptions<TInputs>,
> {
  (options: TPluginOptions): void | Promise<void>
}
