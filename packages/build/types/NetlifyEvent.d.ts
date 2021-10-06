import { NetlifyPluginOptions } from './NetlifyPluginOptions'

export interface NetlifyEvent {
  (options: NetlifyPluginOptions): void | Promise<void>
}
