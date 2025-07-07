import { EXTENSION_API_BASE_URL } from '../../integrations.js'
import { ModeOption } from '../../types/options.js'
import { ROOT_PACKAGE_JSON } from '../json.js'

const configVersion = ROOT_PACKAGE_JSON.version
export type InstallExtensionResult =
  | {
      slug: string
      error: null
    }
  | {
      slug: string
      error: {
        code: string
        message: string
      }
    }

export const installExtension = async ({
  netlifyToken,
  accountId,
  slug,
  hostSiteUrl,
  extensionInstallationSource,
}: {
  netlifyToken: string
  accountId: string
  slug: string
  hostSiteUrl: string
  extensionInstallationSource: ModeOption
}): Promise<InstallExtensionResult> => {
  const userAgent = `Netlify Config (mode:${extensionInstallationSource}) / ${configVersion}`
  const extensionOnInstallUrl = new URL('/.netlify/functions/handler/on-install', hostSiteUrl)
  const installedResponse = await fetch(extensionOnInstallUrl, {
    method: 'POST',
    body: JSON.stringify({
      teamId: accountId,
    }),
    headers: {
      'netlify-token': netlifyToken,
      'User-Agent': userAgent,
    },
  })

  if (!installedResponse.ok && installedResponse.status !== 409) {
    const text = await installedResponse.text()
    return {
      slug,
      error: {
        code: installedResponse.status.toString(),
        message: text,
      },
    }
  }
  return {
    slug,
    error: null,
  }
}

type AutoInstallableExtensionMeta = {
  slug: string
  hostSiteUrl: string
  packages: string[]
}
/**
 * Fetches the list of extensions from Jigsaw that declare associated packages.
 * Used to determine which extensions should be auto-installed based on the packages
 * present in the package.json (e.g., if an extension lists '@netlify/neon',
 * and that package exists in package.json, the extension will be auto-installed).
 *
 * @returns Array of extensions with their associated packages
 */
export async function fetchAutoInstallableExtensionsMeta(): Promise<AutoInstallableExtensionMeta[]> {
  try {
    const url = new URL(`/meta/auto-installable`, process.env.EXTENSION_API_BASE_URL ?? EXTENSION_API_BASE_URL)
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch extensions meta`)
    }
    const data = await response.json()
    return data as AutoInstallableExtensionMeta[]
  } catch (error) {
    console.error(`Failed to fetch auto-installable extensions meta: ${error.message}`, error)
    return []
  }
}
