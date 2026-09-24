import type { Directories } from './directories.js'
import { removeUnset, spreadValue } from './normalize_values.js'
import type { ResolvedOptions } from './options.js'
import type { RawConfig, SiteBuildSettings, SiteInfo, UiPlugin } from './types.js'

export interface DefaultLayer {
  defaultConfig: RawConfig
  baseRelDir: boolean
}

export interface Layers extends DefaultLayer {
  /** `inlineConfig` with `configMutations` applied. */
  inlineConfig: RawConfig
}

export const getDefaultLayer = function ({
  options,
  directories,
  siteInfo,
}: {
  options: ResolvedOptions
  directories: Directories
  siteInfo: SiteInfo
}): DefaultLayer {
  const defaultConfig = addBase(options.defaultConfig, directories.base)
  const { build_settings: buildSettings, plugins: uiPlugins = [] } = siteInfo

  // Without build settings, e.g. in production builds, the buildbot passes them as `defaultConfig`.
  if (buildSettings === undefined || buildSettings === null) {
    return { defaultConfig, baseRelDir: directories.baseRelDir ?? true }
  }

  return {
    defaultConfig: addBuildSettings(defaultConfig, buildSettings, uiPlugins),
    // QUIRK: build settings without `base_rel_dir` make it `false`, not the default `true`.
    baseRelDir: Boolean(directories.baseRelDir ?? buildSettings.base_rel_dir),
  }
}

// The `base` option wins over `defaultConfig.build.base`, as if set in the UI.
const addBase = function (defaultConfig: RawConfig, base: string | undefined): RawConfig {
  if (base === undefined) {
    return defaultConfig
  }

  return { ...defaultConfig, build: { ...spreadValue(defaultConfig['build']), base } }
}

// `defaultConfig.build` is spread over the UI settings, so it wins key by key, even with an
// `undefined` value. UI plugins come first, and only their known properties are kept.
const addBuildSettings = function (
  { build, plugins = [], ...defaultConfig }: RawConfig,
  { cmd: command, dir: publish, functions_dir: functionsDirectory, base }: SiteBuildSettings,
  uiPlugins: readonly UiPlugin[],
): RawConfig {
  const uiBuild = removeUnset({ command, publish, base })
  const pluginsList = uiPlugins.map(({ package: packageName, inputs, pinned_version: pinnedVersion }) => ({
    package: packageName,
    inputs,
    pinned_version: pinnedVersion,
  }))
  return {
    ...defaultConfig,
    build: { ...uiBuild, ...spreadValue(build) },
    plugins: isArray(plugins) ? [...pluginsList, ...plugins] : plugins,
    // QUIRK: applied after `defaultConfig`, so it wins over `defaultConfig.functionsDirectory`,
    // unlike `build`. A blank value is kept, and removed later with its origin left behind.
    ...(functionsDirectory ? { functionsDirectory, functionsDirectoryOrigin: 'ui' } : {}),
  }
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value)
