import { PluginInputs } from './config/inputs'
import { NetlifyPluginOptions } from './netlify_plugin_options'

interface NetlifyEventHandler<PluginOptions extends NetlifyPluginOptions = NetlifyPluginOptions> {
  (options: PluginOptions): void | Promise<void>
}

export type OnPreBuild<TInputs extends PluginInputs = PluginInputs> = NetlifyEventHandler<NetlifyPluginOptions<TInputs>>
export type OnBuild<TInputs extends PluginInputs = PluginInputs> = NetlifyEventHandler<NetlifyPluginOptions<TInputs>>
export type OnPostBuild<TInputs extends PluginInputs = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs>
>
export type OnError<TInputs extends PluginInputs = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs> & { error: Error }
>
export type OnSuccess<TInputs extends PluginInputs = PluginInputs> = NetlifyEventHandler<NetlifyPluginOptions<TInputs>>
export type OnEnd<TInputs extends PluginInputs = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs> & { error?: Error }
>
