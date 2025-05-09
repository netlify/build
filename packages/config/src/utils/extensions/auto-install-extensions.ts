import { createRequire } from 'module'
import { join } from 'path'

import { getIntegrations } from '../../api/site_info.js'
import { type IntegrationResponse } from '../../types/api.js'
import { type ModeOption } from '../../types/options.js'

import { fetchAutoInstallableExtensionsMeta, installExtension } from './utils.js'

function getPackageJSON(directory: string) {
  const require = createRequire(join(directory, 'package.json'))
  return require('./package.json')
}

interface AutoInstallOptions {
  featureFlags: any
  siteId: string
  accountId: string
  token: string
  cwd: string
  accounts: any
  integrations: IntegrationResponse[]
  offline: boolean
  testOpts: any
  mode: ModeOption
  extensionApiBaseUrl: string
}

export async function handleAutoInstallExtensions({
  featureFlags,
  siteId,
  accountId,
  token,
  cwd,
  accounts,
  integrations,
  offline,
  testOpts = {},
  mode,
  extensionApiBaseUrl,
}: AutoInstallOptions) {
  if (!featureFlags?.auto_install_required_extensions || !accountId || !siteId || !token || !cwd || offline) {
    return integrations
  }
  const account = accounts?.find((account: any) => account.id === accountId)
  if (!account) {
    return integrations
  }
  try {
    const packageJson = getPackageJSON(cwd)
    if (
      !packageJson?.dependencies ||
      typeof packageJson?.dependencies !== 'object' ||
      Object.keys(packageJson?.dependencies)?.length === 0
    ) {
      return integrations
    }

    const autoInstallableExtensions = await fetchAutoInstallableExtensionsMeta()
    const extensionsToInstall = autoInstallableExtensions.filter((ext) => {
      return !integrations?.some((integration) => integration.slug === ext.slug)
    })
    if (extensionsToInstall.length === 0) {
      return integrations
    }

    const results = await Promise.all(
      extensionsToInstall.map(async (ext) => {
        console.log(
          `Installing extension "${ext.slug}" on team "${account.name}" required by package(s): "${ext.packages.join(
            '",',
          )}"`,
        )
        return installExtension({
          accountId,
          netlifyToken: token,
          slug: ext.slug,
          hostSiteUrl: ext.hostSiteUrl,
        })
      }),
    )

    if (results.length > 0 && results.some((result) => !result.error)) {
      return getIntegrations({
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
    return integrations
  } catch (error) {
    console.error(`Failed to auto install extension(s): ${error.message}`, error)
    return integrations
  }
}
