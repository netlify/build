import { createRequire } from 'module'
import { join } from 'path'

import { type Extension, getExtensions } from '../../api/site_info.js'
import { type ModeOption } from '../../types/options.js'

import { fetchAutoInstallableExtensionsMeta, installExtension } from './utils.js'

function getPackageJSON(directory: string) {
  try {
    const require = createRequire(join(directory, 'package.json'))
    return require('./package.json')
  } catch {
    // Gracefully fail if no package.json found in buildDir
    return {}
  }
}

interface AutoInstallOptions {
  featureFlags: any
  siteId: string
  accountId: string
  token: string
  buildDir: string
  extensions: Extension[]
  offline: boolean
  testOpts: any
  mode: ModeOption
  extensionApiBaseUrl: string
  debug?: boolean
}

export async function handleAutoInstallExtensions({
  featureFlags,
  siteId,
  accountId,
  token,
  buildDir,
  extensions,
  offline,
  testOpts = {},
  mode,
  extensionApiBaseUrl,
  debug = false,
}: AutoInstallOptions) {
  if (!featureFlags?.auto_install_required_extensions_v2) {
    return extensions
  }
  if (!accountId || !siteId || !token || !buildDir || offline) {
    const reason = !accountId
      ? 'Missing accountId'
      : !siteId
        ? 'Missing siteId'
        : !token
          ? 'Missing token'
          : !buildDir
            ? 'Missing buildDir'
            : 'Running as offline'

    if (debug) {
      console.error(`Failed to auto install extension(s): ${reason}`, {
        accountId,
        siteId,
        buildDir,
        offline,
        mode,
      })
    }
    return extensions
  }

  try {
    const packageJson = getPackageJSON(buildDir)
    if (
      !packageJson?.dependencies ||
      typeof packageJson?.dependencies !== 'object' ||
      Object.keys(packageJson?.dependencies)?.length === 0
    ) {
      return extensions
    }

    const autoInstallableExtensions = await fetchAutoInstallableExtensionsMeta()
    const enabledExtensionSlugs = new Set((extensions ?? []).map(({ slug }) => slug))
    const extensionsToInstallCandidates = autoInstallableExtensions.filter(
      ({ slug }) => !enabledExtensionSlugs.has(slug),
    )
    const extensionsToInstall = extensionsToInstallCandidates.filter(({ packages }) => {
      for (const pkg of packages) {
        if (packageJson?.dependencies && Object.hasOwn(packageJson.dependencies, pkg)) {
          return true
        }
      }
      return false
    })

    if (extensionsToInstall.length === 0) {
      return extensions
    }

    const results = await Promise.all(
      extensionsToInstall.map(async (ext) => {
        console.log(
          `Installing extension "${ext.slug}" on team "${accountId}" required by package(s): "${ext.packages.join(
            '",',
          )}"`,
        )
        return installExtension({
          accountId,
          netlifyToken: token,
          slug: ext.slug,
          hostSiteUrl: ext.hostSiteUrl,
          extensionInstallationSource: mode,
        })
      }),
    )

    if (results.length > 0 && results.some((result) => !result.error)) {
      return getExtensions({
        siteId,
        accountId,
        testOpts,
        offline,
        token,
        featureFlags,
        extensionApiBaseUrl,
        mode,
      })
    }
    return extensions
  } catch (error) {
    console.error(`Failed to auto install extension(s): ${error.message}`, error)
    return extensions
  }
}
