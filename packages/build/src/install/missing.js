import { promises as fs } from 'fs'
import { normalize, resolve } from 'path'

import { execa } from 'execa'
import { pathExists } from 'path-exists'

import { logArray, logSubHeader } from '../log/logger.js'
import { logInstallMissingPlugins, logInstallIntegrations } from '../log/messages/install.js'

import { addExactDependencies } from './main.js'

// Automatically install plugins if not already installed.
// Since this is done under the hood, we always use `npm` with specific `npm`
// options. We do not allow configure the package manager nor its options.
// Users requiring `yarn` or custom npm/yarn flags should install the plugin in
// their `package.json`.
export const installMissingPlugins = async function ({ missingPlugins, autoPluginsDir, mode, logs }) {
  const packages = missingPlugins.map(getPackage)
  logInstallMissingPlugins(logs, missingPlugins, packages)

  if (packages.length === 0) {
    return
  }

  await createAutoPluginsDir(logs, autoPluginsDir)
  await addExactDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
}

export const installIntegrationPlugins = async function ({
  integrations,
  autoPluginsDir,
  mode,
  logs,
  context,
  testOpts,
  pluginsEnv,
  buildDir,
}) {
  const integrationsToBuild = integrations.filter(
    (integration) => typeof integration.dev !== 'undefined' && context === 'dev',
  )
  if (integrationsToBuild.length) {
    logSubHeader(logs, 'Building extensions')
    logArray(
      logs,
      integrationsToBuild.map(({ slug, dev: { path } }) => `${slug} from ${path}`),
    )
  }
  const packages = (
    await Promise.all(
      integrations.map((integration) =>
        getIntegrationPackage({ integration, context, testOpts, buildDir, pluginsEnv }),
      ),
    )
  ).filter(Boolean)
  logInstallIntegrations(
    logs,
    integrations.filter((integration) =>
      integrationsToBuild.every((compiledIntegration) => integration.slug !== compiledIntegration.slug),
    ),
  )

  if (packages.length === 0) {
    return
  }

  await createAutoPluginsDir(logs, autoPluginsDir)

  await addExactDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
}

const getIntegrationPackage = async function ({
  integration: { version, dev },
  context,
  testOpts = {},
  buildDir,
  pluginsEnv,
}) {
  if (typeof version !== 'undefined') {
    return `${version}/packages/buildhooks.tgz`
  }

  if (typeof dev !== 'undefined' && context === 'dev') {
    const { path } = dev

    const integrationDir = testOpts.cwd ? resolve(testOpts.cwd, path) : resolve(buildDir, path)

    try {
      const res = await execa('npm', ['run', 'build'], { cwd: integrationDir, env: pluginsEnv })

      // This is horrible and hacky, but `npm run build` will
      // return status code 0 even if it fails
      if (!res.stdout.includes('Build complete!')) {
        throw new Error(res.stdout)
      }
    } catch (e) {
      throw new Error(`Failed to build integration. Error:\n\n${e.stack}`)
    }

    return undefined
  }

  return undefined
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
  try {
    const stat = await fs.stat(autoPluginsParent)
    if (stat.isFile()) {
      await fs.unlink(autoPluginsParent)
    }
  } catch {
    // do nothing since it doesn't exist
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
