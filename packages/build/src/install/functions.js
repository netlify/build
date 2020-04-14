const { dirname } = require('path')

const readdirp = require('readdirp')

const { logInstallFunctionDependencies } = require('../log/main')

const { installDependencies } = require('./main')

// Install dependencies of Netlify Functions
const installFunctionDependencies = async function(functionsSrc, isLocal) {
  const packagePaths = await readdirp.promise(functionsSrc, { depth: 1, fileFilter: 'package.json' })
  if (packagePaths.length === 0) {
    return
  }

  logInstallFunctionDependencies()

  const packageRoots = packagePaths.map(getPackageRoot)
  await Promise.all(packageRoots.map(packageRoot => installDependencies({ packageRoot, isLocal })))
}

const getPackageRoot = function({ fullPath }) {
  return dirname(fullPath)
}

module.exports = { installFunctionDependencies }
