import { promises as fs } from 'fs'
import { normalize } from 'path'

import { pathExists } from 'path-exists'
import { isFile } from 'path-type'

import { logInstallMissingPlugins } from '../log/messages/install.js'

import { addExactDependencies } from './main.js'

// Automatically install plugins if not already installed.
// Since this is done under the hood, we always use `npm` with specific `npm`
// options. We do not allow configure the package manager nor its options.
// Users requiring `yarn` or custom npm/yarn flags should install the plugin in
// their `package.json`.
export const installMissingPlugins = async function ({ missingPlugins, autoPluginsDir, mode, logs }) {
  const packages = missingPlugins.map(getPackage)
  logInstallMissingPlugins(logs, packages)

  await createAutoPluginsDir(logs, autoPluginsDir)
  await addExactDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
}

// We pin the version without using semver ranges ^ nor ~
const getPackage = function ({ packageName, expectedVersion }) {
  return `${packageName}@${expectedVersion}`
}

const createAutoPluginsDir = async function (logs, autoPluginsDir) {
  await ensureDir(logs, autoPluginsDir)
  await createPackageJson(autoPluginsDir)
}

// Create the directory if it does not exist
const ensureDir = async function (logs, autoPluginsDir) {
  if (await pathExists(autoPluginsDir)) {
    return
  }

  // If `.netlify` exists but is not a directory, we remove it first
  const autoPluginsParent = normalize(`${autoPluginsDir}/..`)
  if (await isFile(autoPluginsParent)) {
    await fs.unlink(autoPluginsParent)
  }

  await fs.mkdir(autoPluginsDir, { recursive: true })
}

// Create a dummy `package.json` so we can run `npm install` and get a lock file
const createPackageJson = async function (autoPluginsDir) {
  const packageJsonPath = `${autoPluginsDir}/package.json`
  if (await pathExists(packageJsonPath)) {
    return
  }

  const packageJsonContent = JSON.stringify(AUTO_PLUGINS_PACKAGE_JSON, null, 2)
  await fs.writeFile(packageJsonPath, packageJsonContent)
}

const AUTO_PLUGINS_PACKAGE_JSON = {
  name: 'netlify-local-plugins',
  description: 'This directory contains Build plugins that have been automatically installed by Netlify.',
  version: '1.0.0',
  private: true,
  author: 'Netlify',
  license: 'MIT',
}
