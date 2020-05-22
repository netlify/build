const { dirname, resolve } = require('path')

const readdirp = require('readdirp')

const { addErrorInfo } = require('../error/info')
const { logInstallFunctionDependencies } = require('../log/main')

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

  const error = new Error(`Please use the plugin "@netlify/plugin-functions-install-core" to install dependencies from the "package.json" inside your "${functionsSrc}" directory.
Example "netlify.toml":

  [build]
  functions = "${functionsSrc}"

  [[plugins]]
  package = "@netlify/plugin-functions-install-core"`)
  addErrorInfo(error, { type: 'resolveConfig' })
  throw error
}

const isFunctionsInstallPlugin = function({ package }) {
  return package === '@netlify/plugin-functions-install-core'
}

module.exports = { installFunctionDependencies, checkDeprecatedFunctionsInstall }
