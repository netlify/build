import { NetlifyPluginOptions } from './netlify_plugin_options'

export interface NetlifyEvent<PluginOptions extends NetlifyPluginOptions = NetlifyPluginOptions> {
  (options: PluginOptions): void | Promise<void>
}
