import { NetlifyPluginOptions } from './netlify_plugin_options'

export interface NetlifyEvent {
  (options: NetlifyPluginOptions): void | Promise<void>
}
