import type { SiteBuildSettings, SiteInfo, UiPluginConfig } from '../types/api.js'
import type { PartialNetlifyConfig } from '../types/config.js'
import { removeFalsy } from '../utils/remove_falsy.js'

type BuildSettingsOptions = {
  defaultConfig: PartialNetlifyConfig
  baseRelDir: boolean | undefined
  siteInfo: SiteInfo
}

/**
 * Add the UI build settings and UI-installed plugins to `defaultConfig`. Production builds get
 * these from the buildbot instead, through `defaultConfig`, and have no `build_settings`.
 */
export const addBuildSettings = function ({
  defaultConfig,
  baseRelDir,
  siteInfo: { build_settings: buildSettings, plugins: uiPlugins = [] },
}: BuildSettingsOptions): { defaultConfig: PartialNetlifyConfig; baseRelDir: boolean | undefined } {
  if (buildSettings === undefined) {
    return { defaultConfig, baseRelDir }
  }

  return {
    defaultConfig: getDefaultConfig(buildSettings, defaultConfig, uiPlugins),
    baseRelDir: Boolean(baseRelDir ?? buildSettings.base_rel_dir),
  }
}

const getDefaultConfig = function (
  { cmd: command, dir: publish, functions_dir: functionsDirectory, base }: SiteBuildSettings,
  { build, plugins = [], ...defaultConfig }: PartialNetlifyConfig,
  uiPlugins: UiPluginConfig[],
): PartialNetlifyConfig {
  const siteBuild = removeFalsy({ command, publish, base })
  const functions = functionsDirectory ? { functionsDirectory, functionsDirectoryOrigin: 'ui' as const } : {}
  // Only the properties known to be plugin configuration.
  const normalizedUiPlugins = uiPlugins.map(({ package: packageName, inputs, pinned_version: pinnedVersion }) => ({
    package: packageName,
    inputs,
    pinned_version: pinnedVersion,
  }))
  return {
    ...defaultConfig,
    build: { ...siteBuild, ...build },
    plugins: [...normalizedUiPlugins, ...plugins],
    ...functions,
  }
}
