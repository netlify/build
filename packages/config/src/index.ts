export { cleanupConfig } from './cleanup.js'
export { mergeConfigs } from './merge.js'
export { applyMutations, DEV_EVENTS, EVENTS } from './mutations.js'
export { resolveConfig } from './resolve.js'
export { restoreConfig, updateConfig, type UpdateConfigOptions } from './update.js'

export type { UserError } from './error.js'
export type {
  Account,
  BufferedLogs,
  BuildConfig,
  Config,
  ConfigExtension,
  ConfigMutation,
  ConfigOrigin,
  EdgeFunctionDeclaration,
  EnvironmentVariable,
  EnvironmentVariableSource,
  Extension,
  ExtensionBuildPlugin,
  FunctionConfig,
  FunctionsConfig,
  FunctionsDirectoryOrigin,
  Header,
  Integration,
  Logs,
  Mode,
  NetlifyConfig,
  NodeBundler,
  OutputFlusher,
  PluginConfig,
  ProcessingConfig,
  RawConfig,
  Redirect,
  ResolveConfigOptions,
  SiteBuildSettings,
  SiteInfo,
  StreamedLogs,
  TestOptions,
  UiPlugin,
} from './types.js'
