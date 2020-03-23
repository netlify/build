const { promisify } = require('util')

const resolve = require('resolve')
const pFilter = require('p-filter')

const { logInstallMissingPlugins } = require('../log/main')

const { addDependencies } = require('./main')

const pResolve = promisify(resolve)

// Automatically install plugins if not installed already
const installMissingPlugins = async function(pluginsOptions, basedir) {
  const missingPlugins = await pFilter(pluginsOptions, pluginOptions => isMissingPlugin(pluginOptions, basedir))
  if (missingPlugins.length === 0) {
    return
  }

  const packages = missingPlugins.map(getPackage)
  logInstallMissingPlugins(packages)
  await addDependencies({ packageRoot: basedir, packages })
}

const isMissingPlugin = async function({ location }, basedir) {
  try {
    await pResolve(location, { basedir })
    return false
  } catch (error) {
    return true
  }
}

const getPackage = function({ package }) {
  return package
}

module.exports = { installMissingPlugins }
