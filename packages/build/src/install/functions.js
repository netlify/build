import { dirname } from 'path'

import readdirp from 'readdirp'

import { logInstallFunctionDependencies } from '../log/messages/install.js'

import { installDependencies } from './main.js'

// Install dependencies of Netlify Functions
export const installFunctionDependencies = async function (functionsSrc, isLocal) {
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
