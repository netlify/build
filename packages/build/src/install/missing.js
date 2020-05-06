const pFilter = require('p-filter')

const { logInstallMissingPlugins } = require('../log/main')
const { resolveLocation } = require('../utils/resolve')

const { addDependencies } = require('./main')

// Automatically install plugins if not installed already
const installMissingPlugins = async function({ pluginsOptions, buildDir, mode }) {
  const missingPlugins = await pFilter(pluginsOptions, pluginOptions => isMissingPlugin(pluginOptions, buildDir))
  if (missingPlugins.length === 0) {
    return
  }

  const packages = missingPlugins.map(getPackage)
  logInstallMissingPlugins(packages)
  await addDependencies({ packageRoot: buildDir, isLocal: mode !== 'buildbot', packages })
}

const isMissingPlugin = async function({ location, core }, buildDir) {
  if (core) {
    return false
  }

  try {
    await resolveLocation(location, buildDir)
    return false
  } catch (error) {
    return true
  }
}

const getPackage = function({ package }) {
  return package
}

module.exports = { installMissingPlugins }
