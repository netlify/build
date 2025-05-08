import { Project } from '@netlify/build-info'
import { NodeFS } from '@netlify/build-info/node'
import { NetlifyAPI } from 'netlify'

import { JIGSAW_URL } from './constants.js'
import {
  getExtension,
  getInstalledExtensionsForSite,
  installExtension,
  InstallExtensionResult,
  getAccount,
} from './utils.js'

export async function handleAutoInstallExtensions(opts: $TSFixMe, api?: NetlifyAPI) {
  if (!opts.accountId || !opts.token || !api?.accessToken) {
    // skip installing extensions if not logged in
    return
  }

  const installableExtensions = await getExtensionsToInstall(opts, api)
  if (installableExtensions.length === 0) {
    return
  }

  const netlifyToken = opts.token
  const accountId = opts.accountId
  const account = await getAccount(api, { accountId })

  const results: InstallExtensionResult[] = await Promise.all(
    installableExtensions.map((installableExt) => {
      if (!installableExt.hostSiteUrl) {
        return {
          slug: installableExt.slug,
          error: {
            code: 'FAILED_TO_FETCH_EXTENSION',
            message: 'Failed to fetch extension host site url',
          },
        }
      }

      console.log(
        `Installing extension "${installableExt.name ?? installableExt.slug}" on team "${
          account.name
        }" required by package(s): "${installableExt.meta.packages.join('",')}"`,
      )

      return installExtension({
        accountId: accountId,
        netlifyToken: netlifyToken,
        slug: installableExt.slug,
        hostSiteUrl: installableExt.hostSiteUrl,
      })
    }),
  )

  results.forEach(({ error, slug }) => {
    if (error) {
      console.warn(`Failed to install "${slug}" extension on team "${account.name}": ${error.message}`)
      return
    }
    const ext = installableExtensions.find((ext) => ext.slug === slug)
    console.log(`Installed${ext?.name ? ` "${ext.name}" ` : ` "${slug}" `}extension on team "${account.name}"`)
  })
}

async function getExtensionsToInstall(opts: $TSFixMe, api: NetlifyAPI) {
  if (!opts.accountId || !api.accessToken) {
    // skip installing extensions if not logged in
    return []
  }

  const netlifyToken = api.accessToken.replace('Bearer ', '')
  const accountId = opts.accountId
  const siteId = opts.siteId

  const fs = new NodeFS()
  const project = new Project(fs, opts.repositoryRoot, opts.repositoryRoot)
    .setEnvironment(process.env)
    .setNodeVersion(process.version)

  const [autoInstallableExtensions, packageJson, installedExtensions] = await Promise.all([
    getAutoInstallableExtensions(),
    project.getPackageJSON(),
    getInstalledExtensionsForSite({
      accountId: accountId,
      siteId: siteId,
      netlifyToken: netlifyToken,
    }),
  ])

  const autoInstallExtensions = autoInstallableExtensions.filter((extension) => {
    return extension.packages.some((pkg) => {
      return packageJson.dependencies?.[pkg]
    })
  })

  const extensionsToInstallMeta = autoInstallExtensions.filter((extension) => {
    return !installedExtensions.find((installedExtension) => installedExtension.integrationSlug === extension.slug)
  })

  const extensionsToInstall = (
    await Promise.all(
      extensionsToInstallMeta.map(async (extMeta) => {
        const extensionData = await getExtension({
          accountId: accountId,
          netlifyToken: netlifyToken,
          slug: extMeta.slug,
        })

        return {
          slug: extMeta.slug,
          ...(extensionData ?? {}),
          meta: extMeta,
        }
      }),
    )
  ).filter(Boolean)

  return extensionsToInstall
}

type AutoInstallableExtensionMeta = {
  slug: string
  packages: string[]
}
export async function getAutoInstallableExtensions() {
  const url = new URL(`/meta/auto-installable`, JIGSAW_URL)
  const metaResponse = await fetch(url.toString())
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch extensions meta`)
  }
  const meta = await metaResponse.json()
  return meta as AutoInstallableExtensionMeta[]
}
