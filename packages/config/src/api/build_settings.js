const { removeFalsy } = require('../utils/remove_falsy')

// Netlify UI build settings are used as default configuration values in
// production. In local builds, we retrieve them with `getSite` (`siteInfo`)
// instead.
const addBuildSettings = function({ defaultConfig, baseRelDir, siteInfo: { build_settings: buildSettings } }) {
  if (buildSettings === undefined) {
    return { defaultConfig, baseRelDir }
  }

  const defaultConfigA = getDefaultConfig(buildSettings, defaultConfig)
  const baseRelDirA = getBaseRelDir(buildSettings, baseRelDir)
  return { defaultConfig: defaultConfigA, baseRelDir: baseRelDirA }
}

// From the `getSite` API response to the corresponding configuration properties
const getDefaultConfig = function(
  { cmd: command, dir: publish, functions_dir: functions, base, env: environment },
  { build, ...defaultConfig },
) {
  const siteBuild = removeFalsy({ command, publish, functions, base, environment })
  return { ...defaultConfig, build: { ...siteBuild, ...build } }
}

const getBaseRelDir = function({ base_rel_dir: siteBaseRelDir }, baseRelDir = siteBaseRelDir) {
  return Boolean(baseRelDir)
}

module.exports = { addBuildSettings }
