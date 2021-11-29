import { PluginInputs, StringKeys } from './config/inputs'
import { NetlifyPluginOptions } from './netlify_plugin_options'

interface NetlifyEventHandler<PluginOptions extends NetlifyPluginOptions = NetlifyPluginOptions> {
  (options: PluginOptions): void | Promise<void>
}

// To allow interfaces to be used as generics, since they lack implicit index signatures, we have to do some type shenanigans
// to get TypeScript to behave as we want - only letting the keys of `TInputs` through, and thus not requiring a full index
// signature on `TInputs`.
// Related issues: https://github.com/microsoft/TypeScript/issues/15300, https://github.com/netlify/build/issues/3838
export type OnPreBuild<TInputs extends PluginInputs<StringKeys<TInputs>> = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs>
>
export type OnBuild<TInputs extends PluginInputs<StringKeys<TInputs>> = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs>
>
export type OnPostBuild<TInputs extends PluginInputs<StringKeys<TInputs>> = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs>
>
export type OnError<TInputs extends PluginInputs<StringKeys<TInputs>> = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs> & { error: Error }
>
export type OnSuccess<TInputs extends PluginInputs<StringKeys<TInputs>> = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs>
>
export type OnEnd<TInputs extends PluginInputs<StringKeys<TInputs>> = PluginInputs> = NetlifyEventHandler<
  NetlifyPluginOptions<TInputs> & { error?: Error }
>
