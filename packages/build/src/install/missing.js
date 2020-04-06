const { promisify } = require('util')

const pFilter = require('p-filter')
const resolve = require('resolve')

const { logInstallMissingPlugins } = require('../log/main')

const { addDependencies } = require('./main')

const pResolve = promisify(resolve)

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

const isMissingPlugin = async function({ location }, buildDir) {
  try {
    await pResolve(location, { basedir: buildDir })
    return false
  } catch (error) {
    return true
  }
}

const getPackage = function({ package }) {
  return package
}

module.exports = { installMissingPlugins }
