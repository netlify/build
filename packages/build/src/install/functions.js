const { dirname, resolve } = require('path')

const readdirp = require('readdirp')

const { logInstallFunctionDependencies, logDeprecatedFunctionsInstall } = require('../log/main')

const { installDependencies } = require('./main')

// Install dependencies of Netlify Functions
const installFunctionDependencies = async function(functionsSrc, isLocal) {
  const packagePaths = await getPackagePaths(functionsSrc)
  if (packagePaths.length === 0) {
    return
  }

  logInstallFunctionDependencies()

  const packageRoots = packagePaths.map(getPackageRoot)
  await Promise.all(packageRoots.map(packageRoot => installDependencies({ packageRoot, isLocal })))
}

const getPackagePaths = function(functionsSrc) {
  return readdirp.promise(functionsSrc, { depth: 1, fileFilter: 'package.json' })
}

const getPackageRoot = function({ fullPath }) {
  return dirname(fullPath)
}

const checkDeprecatedFunctionsInstall = async function(plugins, functionsSrc, buildDir) {
  if (functionsSrc === undefined) {
    return
  }

  const usesNewSyntax = plugins.some(isFunctionsInstallPlugin)
  if (usesNewSyntax) {
    return
  }

  const packagePaths = await getPackagePaths(resolve(buildDir, functionsSrc))
  if (packagePaths.length === 0) {
    return
  }

  logDeprecatedFunctionsInstall(functionsSrc)
}

const isFunctionsInstallPlugin = function({ package }) {
  return package === '@netlify/plugin-functions-install-core'
}

module.exports = { installFunctionDependencies, checkDeprecatedFunctionsInstall }
