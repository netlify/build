import { createRequire } from 'module'
import { join } from 'path'

import { getExtensions } from '../../api/site_info.js'
import type { Extension } from '../../types/api.js'
import type { ModeOption, TestOptions } from '../../types/options.js'

import { fetchAutoInstallableExtensionsMeta, installExtension } from './utils.js'

type AutoInstallOptions = {
  featureFlags: Record<string, boolean>
  siteId: string | undefined
  accountId: string | undefined
  token: string | undefined
  buildDir: string
  extensions: Extension[]
  offline: boolean
  testOpts: TestOptions
  mode: ModeOption
  extensionApiBaseUrl: string
  debug: boolean
}

type PackageJson = { dependencies?: unknown }

// An empty object when there is no `package.json`.
const getPackageJson = function (directory: string): PackageJson {
  try {
    return createRequire(join(directory, 'package.json'))('./package.json') as PackageJson
  } catch {
    return {}
  }
}

/**
 * Behind the `auto_install_required_extensions_v2` feature flag, install the extensions whose
 * packages the site depends on and that aren't installed yet, then fetch the site's extensions
 * again. Failures are logged and the extensions returned unchanged.
 */
export async function handleAutoInstallExtensions({
  featureFlags,
  siteId,
  accountId,
  token,
  buildDir,
  extensions,
  offline,
  testOpts,
  mode,
  extensionApiBaseUrl,
  debug,
}: AutoInstallOptions): Promise<Extension[]> {
  if (!featureFlags.auto_install_required_extensions_v2) {
    return extensions
  }

  if (!accountId || !siteId || !token || !buildDir || offline) {
    if (debug) {
      console.error(`Failed to auto install extension(s): ${getSkipReason({ accountId, siteId, token, buildDir })}`, {
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
    const { dependencies } = getPackageJson(buildDir)
    if (typeof dependencies !== 'object' || dependencies === null || Object.keys(dependencies).length === 0) {
      return extensions
    }

    const autoInstallableExtensions = await fetchAutoInstallableExtensionsMeta()
    const installedSlugs = new Set(extensions.map(({ slug }) => slug))
    const extensionsToInstall = autoInstallableExtensions.filter(
      ({ slug, packages }) =>
        !installedSlugs.has(slug) && packages.some((packageName) => Object.hasOwn(dependencies, packageName)),
    )
    if (extensionsToInstall.length === 0) {
      return extensions
    }

    const results = await Promise.all(
      extensionsToInstall.map(async (extension) => {
        console.log(
          `Installing extension "${extension.slug}" on team "${accountId}" required by package(s): "${extension.packages.join('",')}"`,
        )
        return await installExtension({
          accountId,
          netlifyToken: token,
          slug: extension.slug,
          hostSiteUrl: extension.hostSiteUrl,
          extensionInstallationSource: mode,
        })
      }),
    )

    if (results.some((result) => !result.error)) {
      return await getExtensions({
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
    console.error(
      `Failed to auto install extension(s): ${error instanceof Error ? error.message : String(error)}`,
      error,
    )
    return extensions
  }
}

const getSkipReason = function ({
  accountId,
  siteId,
  token,
  buildDir,
}: Pick<AutoInstallOptions, 'accountId' | 'siteId' | 'token' | 'buildDir'>) {
  if (!accountId) return 'Missing accountId'
  if (!siteId) return 'Missing siteId'
  if (!token) return 'Missing token'
  if (!buildDir) return 'Missing buildDir'
  return 'Running as offline'
}
