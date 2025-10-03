import { buildSite } from './core/main.js'
export { NetlifyPluginConstants } from './core/constants.js'

export type { BufferedLogs as Logs } from './log/logger.js'
export type { GeneratedFunction } from './steps/return_values.js'
// export the legacy types
export type { NetlifyPlugin } from './types/netlify_plugin.js'
export type { NetlifyPluginOptions } from './types/netlify_plugin_options.js'
export type { OnBuild, OnEnd, OnError, OnPostBuild, OnPreBuild, OnSuccess } from './types/netlify_event_handler.js'
export type { NetlifyConfig } from './types/config/netlify_config.js'
export type { NetlifyPluginUtils } from './types/options/netlify_plugin_utils.js'
export type { ListedFunction, ListedFunctionFile } from './types/options/netlify_plugin_functions_util.js'

// actual main types
export { startDev } from './core/dev.js'
export { runCoreSteps } from './steps/run_core_steps.js'

// default export the buildSite function
export default buildSite
