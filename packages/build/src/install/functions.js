'use strict'

const { dirname } = require('path')

const readdirp = require('readdirp')

const { logInstallFunctionDependencies } = require('../log/messages/install')

const { installDependencies } = require('./main')

// Install dependencies of Netlify Functions
const installFunctionDependencies = async function (functionsSrc, isLocal) {
  const packagePaths = await getPackagePaths(functionsSrc)
  if (packagePaths.length === 0) {
    return
  }

  logInstallFunctionDependencies()

  const packageRoots = packagePaths.map(getPackageRoot)
  await Promise.all(packageRoots.map((packageRoot) => installDependencies({ packageRoot, isLocal })))
}

const getPackagePaths = function (functionsSrc) {
  return readdirp.promise(functionsSrc, { depth: 1, fileFilter: 'package.json' })
}

const getPackageRoot = function ({ fullPath }) {
  return dirname(fullPath)
}

module.exports = { installFunctionDependencies }
