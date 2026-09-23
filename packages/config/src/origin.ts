import type { ConfigOrigin } from './types/config.js'
import { isTruthy } from './utils/remove_falsy.js'
import type { SourceCheckedConfig } from './validate/validations.js'

export const UI_ORIGIN = 'ui' satisfies ConfigOrigin
export const CONFIG_ORIGIN = 'config' satisfies ConfigOrigin
export const DEFAULT_ORIGIN = 'default' satisfies ConfigOrigin
export const INLINE_ORIGIN = 'inline' satisfies ConfigOrigin

/**
 * Record where `build.command`, `build.publish`, each plugin, `headers` and `redirects` came from.
 * A plugin's own `origin` is kept if it has one.
 */
export const addOrigins = function (config: SourceCheckedConfig, origin: ConfigOrigin): SourceCheckedConfig {
  const { build = {}, plugins, headers, redirects } = config
  const withBuildOrigins = isTruthy(build.command) || isTruthy(build['publish'])
  return {
    ...config,
    ...(withBuildOrigins && {
      build: {
        ...build,
        ...(isTruthy(build.command) && { commandOrigin: origin }),
        ...(isTruthy(build['publish']) && { publishOrigin: origin }),
      },
    }),
    ...(Array.isArray(plugins) && { plugins: plugins.map((plugin) => ({ origin, ...plugin })) }),
    ...(isTruthy(headers) && { headersOrigin: origin }),
    ...(isTruthy(redirects) && { redirectsOrigin: origin }),
  }
}
