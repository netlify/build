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
  if (!featureFlags?.auto_install_required_extensions) {
    return integrations
  }
  if (!accountId) {
    console.error("Failed to auto install extension(s): Missing 'accountId'", {
      accountId,
      siteId,
      cwd,
      offline,
      mode,
    })
    return integrations
  }
  if (!siteId) {
    console.error("Failed to auto install extension(s): Missing 'siteId'", {
      accountId,
      siteId,
      cwd,
      offline,
      mode,
    })
    return integrations
  }
  if (!token) {
    console.error("Failed to auto install extension(s): Missing 'token'", {
      accountId,
      siteId,
      cwd,
      offline,
      mode,
    })
    return integrations
  }
  if (!cwd) {
    console.error("Failed to auto install extension(s): Missing 'cwd'", {
      accountId,
      siteId,
      cwd,
      offline,
      mode,
    })
    return integrations
  }
  if (offline) {
    console.error("Failed to auto install extension(s): Running as 'offline'", {
      accountId,
      siteId,
      cwd,
      offline,
      mode,
    })
    return integrations
  }

  try {
    const account = accounts?.find((account: any) => account.id === accountId)
    if (!account) {
      console.error(`Failed to auto install extension(s): Couldn't find 'account' with id '${accountId}'`, {
        accountId,
        siteId,
        cwd,
        offline,
        mode,
      })
      return integrations
    }

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
