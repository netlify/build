const { logInstallMissingPlugins } = require('../log/main')

const { addDependencies } = require('./main')

// Automatically install plugins if not installed already nor cached in the build image
const installMissingPlugins = async function({ pluginsOptions, buildDir, mode }) {
  const packages = pluginsOptions.filter(({ pluginPath }) => pluginPath === undefined).map(getPackage)
  if (packages.length === 0) {
    return
  }

  logInstallMissingPlugins(packages)
  await addDependencies({ packageRoot: buildDir, isLocal: mode !== 'buildbot', packages })
}

const getPackage = function({ package }) {
  return package
}

module.exports = { installMissingPlugins }
