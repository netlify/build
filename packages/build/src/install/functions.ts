import { dirname } from 'path'

import { type EntryInfo, readdirpPromise } from 'readdirp'

import { logInstallFunctionDependencies } from '../log/messages/install.js'

import { installDependencies } from './main.js'

// Install dependencies of Netlify Functions
export const installFunctionDependencies = async function (functionsSrc: string, isLocal: boolean): Promise<void> {
  const packagePaths = await getPackagePaths(functionsSrc)
  if (packagePaths.length === 0) {
    return
  }

  logInstallFunctionDependencies()

  const packageRoots = packagePaths.map(getPackageRoot)
  await Promise.all(packageRoots.map((packageRoot) => installDependencies({ packageRoot, isLocal })))
}

const getPackagePaths = function (functionsSrc: string): Promise<EntryInfo[]> {
  return readdirpPromise(functionsSrc, { depth: 1, fileFilter: 'package.json' })
}

const getPackageRoot = function ({ fullPath }: EntryInfo): string {
  return dirname(fullPath)
}
