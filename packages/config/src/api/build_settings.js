'use strict'

const { removeFalsy } = require('../utils/remove_falsy')

// Netlify UI build settings are used as default configuration values in
// production. In local builds, we retrieve them with `getSite` (`siteInfo`)
// instead.
// This also includes UI-installed plugins.
const addBuildSettings = function ({
  defaultConfig,
  baseRelDir,
  siteInfo: { build_settings: buildSettings, plugins },
}) {
  if (buildSettings === undefined) {
    return { defaultConfig, baseRelDir }
  }

  const defaultConfigA = getDefaultConfig(buildSettings, defaultConfig, plugins)
  const baseRelDirA = getBaseRelDir(buildSettings, baseRelDir)
  return { defaultConfig: defaultConfigA, baseRelDir: baseRelDirA }
}

// From the `getSite` API response to the corresponding configuration properties
const getDefaultConfig = function (
  { cmd: command, dir: publish, functions_dir: functions, base, env: environment },
  { build, plugins = [], ...defaultConfig },
  uiPlugins = [],
) {
  const siteBuild = removeFalsy({ command, publish, functions, base, environment })
  const uiPluginsA = uiPlugins.map(normalizeUiPlugin)
  const pluginsA = [...uiPluginsA, ...plugins]
  return { ...defaultConfig, build: { ...siteBuild, ...build }, plugins: pluginsA }
}

// Make sure we know which fields we are picking from the API
const normalizeUiPlugin = function ({ package: packageName, inputs }) {
  return { package: packageName, inputs }
}

const getBaseRelDir = function ({ base_rel_dir: siteBaseRelDir }, baseRelDir = siteBaseRelDir) {
  return Boolean(baseRelDir)
}

module.exports = { addBuildSettings }
