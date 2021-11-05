import { NetlifyPluginOptions } from './netlify_plugin_options'

export interface NetlifyEventHandler<PluginOptions extends NetlifyPluginOptions = NetlifyPluginOptions> {
  (options: PluginOptions): void | Promise<void>
}
