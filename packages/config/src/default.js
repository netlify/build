import { addBuildSettings } from './api/build_settings.js'
import { logDefaultConfig } from './log/main.js'

// Retrieve default configuration file. It has less priority and it also does
// not get normalized, merged with contexts, etc.
export const parseDefaultConfig = function ({ defaultConfig, base, baseRelDir, siteInfo, logs, debug }) {
  const defaultConfigB = addDefaultConfigBase(defaultConfig, base)
  const { defaultConfig: defaultConfigC, baseRelDir: baseRelDirA = DEFAULT_BASE_REL_DIR } = addBuildSettings({
    defaultConfig: defaultConfigB,
    baseRelDir,
    siteInfo,
  })
  logDefaultConfig(defaultConfigC, { logs, debug, baseRelDir: baseRelDirA })
  return { defaultConfig: defaultConfigC, baseRelDir: baseRelDirA }
}

// When the `base` was overridden, add it to `defaultConfig` so it behaves
// as if it had been specified in the UI settings
const addDefaultConfigBase = function (defaultConfig, base) {
  if (base === undefined) {
    return defaultConfig
  }

  const { build = {} } = defaultConfig
  return { ...defaultConfig, build: { ...build, base } }
}

// `baseRelDir` should default to `true` only if the option was not passed and
// it could be retrieved from the `siteInfo`, which is why the default value
// is assigned later than other properties.
const DEFAULT_BASE_REL_DIR = true
