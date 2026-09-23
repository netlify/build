export { DEV_EVENTS, EVENTS } from './events.js'
export { cleanupConfig } from './log/cleanup.js'
export { resolveConfig } from './main.js'
export { mergeConfigs } from './merge.js'
export { applyMutations } from './mutations/apply.js'
export { restoreConfig, updateConfig } from './mutations/update.js'

export type { UserError } from './error.js'
export type {
  Extension,
  ExtensionBuildPlugin,
  ExtensionWithDev,
  MinimalAccount,
  SiteBuildSettings,
  SiteInfo,
  UiPluginConfig,
} from './types/api.js'
export type {
  BuildConfig,
  ConfigExtension,
  ConfigOrigin,
  EdgeFunctionDeclaration,
  FunctionConfig,
  FunctionsConfig,
  FunctionsDirectoryOrigin,
  NodeBundler,
  NormalizedNetlifyConfig,
  PartialNetlifyConfig,
  PluginConfig,
  ProcessingConfig,
  Redirect,
  ResolvedNetlifyConfig,
} from './types/config.js'
export type { BufferedLogs, Logs, OutputFlusher, StreamedLogs } from './types/logs.js'
export type { ConfigMutation } from './types/mutations.js'
export type { ModeOption, ResolveConfigOptions, TestOptions } from './types/options.js'
export type { Config, EnvironmentVariable, EnvironmentVariableSource } from './types/result.js'
