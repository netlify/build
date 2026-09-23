import { addBuildSettings } from './api/build_settings.js'
import { logDefaultConfig } from './log/main.js'
import type { SiteInfo } from './types/api.js'
import type { PartialNetlifyConfig } from './types/config.js'
import type { Logs } from './types/logs.js'

type DefaultConfigOptions = {
  defaultConfig: PartialNetlifyConfig
  /** Base directory override, which behaves as if set in the UI. */
  base: string | undefined
  baseRelDir: boolean | undefined
  siteInfo: SiteInfo
  logs: Logs | undefined
  debug: boolean
}

/**
 * The default configuration: the `defaultConfig` option, with the UI build settings. Lowest priority.
 * `baseRelDir` defaults to true only when neither the option nor the site sets it, so it is
 * resolved here rather than with the other options.
 */
export const parseDefaultConfig = function ({
  defaultConfig,
  base,
  baseRelDir,
  siteInfo,
  logs,
  debug,
}: DefaultConfigOptions): { defaultConfig: PartialNetlifyConfig; baseRelDir: boolean } {
  const withBase = base === undefined ? defaultConfig : { ...defaultConfig, build: { ...defaultConfig.build, base } }
  const { defaultConfig: withBuildSettings, baseRelDir: resolvedBaseRelDir = true } = addBuildSettings({
    defaultConfig: withBase,
    baseRelDir,
    siteInfo,
  })
  logDefaultConfig(withBuildSettings, { logs, debug, baseRelDir: resolvedBaseRelDir })
  return { defaultConfig: withBuildSettings, baseRelDir: resolvedBaseRelDir }
}
