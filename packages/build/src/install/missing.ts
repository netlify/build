import { promises as fs } from 'node:fs'
import { normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Mode } from '../core/types.js'
import type { Logs } from '../log/logger.js'
import { logInstallMissingPlugins, logInstallIntegrations } from '../log/messages/install.js'
import { pathExists } from '../utils/path_exists.js'

import { addExactDependencies } from './main.js'

type MissingPlugin = { packageName: string; expectedVersion: string }

// Subset of `@netlify/config`'s `ExtensionWithDev`, which that package does not export
type Integration = { slug: string; buildPlugin: { packageURL: URL } | null }

type IntegrationContext = {
  context: string
  testOpts: Record<string, unknown>
  pluginsEnv: NodeJS.ProcessEnv
  buildDir: string
}

// Automatically install plugins if not already installed.
// Since this is done under the hood, we always use `npm` with specific `npm`
// options. We do not allow configure the package manager nor its options.
// Users requiring `yarn` or custom npm/yarn flags should install the plugin in
// their `package.json`.
export const installMissingPlugins = async function ({
  missingPlugins,
  autoPluginsDir,
  mode,
  logs,
}: {
  missingPlugins: readonly MissingPlugin[]
  autoPluginsDir: string
  mode: Mode
  logs: Logs | undefined
}): Promise<void> {
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
}: IntegrationContext & {
  integrations: readonly Integration[]
  autoPluginsDir: string
  mode: Mode
  logs: Logs | undefined
}): Promise<void> {
  const packages = integrations
    .map((integration) => getIntegrationPackage({ integration }))
    .filter((pkg): pkg is string => Boolean(pkg))
  logInstallIntegrations(logs, integrations)

  if (packages.length === 0) {
    return
  }

  await createAutoPluginsDir(logs, autoPluginsDir)
  await addExactDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
}

const getIntegrationPackage = function ({
  integration: { buildPlugin },
}: {
  integration: Integration
}): string | undefined {
  if (buildPlugin === null) {
    return undefined
  }

  switch (buildPlugin.packageURL.protocol) {
    case 'http:':
    // fallthrough
    case 'https:':
      return buildPlugin.packageURL.toString()
    case 'file:':
      return fileURLToPath(buildPlugin.packageURL)
    default:
      throw new Error(`unsupported build plugin package URL: ${buildPlugin.packageURL.toString()}`)
  }
}

// We pin the version without using semver ranges ^ nor ~
const getPackage = function ({ packageName, expectedVersion }: MissingPlugin): string {
  return `${packageName}@${expectedVersion}`
}

const createAutoPluginsDir = async function (logs: Logs | undefined, autoPluginsDir: string): Promise<void> {
  await ensureDir(logs, autoPluginsDir)
  await createPackageJson(autoPluginsDir)
}

// Create the directory if it does not exist
const ensureDir = async function (_logs: Logs | undefined, autoPluginsDir: string): Promise<void> {
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
const createPackageJson = async function (autoPluginsDir: string): Promise<void> {
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
