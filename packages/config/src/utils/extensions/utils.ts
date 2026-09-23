import { EXTENSION_API_BASE_URL } from '../../extensions.js'
import type { ModeOption } from '../../types/options.js'
import { ROOT_PACKAGE_JSON } from '../json.js'

export type InstallExtensionResult =
  | { slug: string; error: null }
  | { slug: string; error: { code: string; message: string } }

type InstallExtensionOptions = {
  netlifyToken: string
  accountId: string
  slug: string
  hostSiteUrl: string
  extensionInstallationSource: ModeOption
}

/** Install an extension on a team, through the extension's own install endpoint. `409` means it's already installed. */
export const installExtension = async ({
  netlifyToken,
  accountId,
  slug,
  hostSiteUrl,
  extensionInstallationSource,
}: InstallExtensionOptions): Promise<InstallExtensionResult> => {
  const response = await fetch(new URL('/.netlify/functions/handler/on-install', hostSiteUrl), {
    method: 'POST',
    body: JSON.stringify({ teamId: accountId }),
    headers: {
      'netlify-token': netlifyToken,
      'User-Agent': `Netlify Config (mode:${extensionInstallationSource}) / ${ROOT_PACKAGE_JSON.version}`,
    },
  })

  if (!response.ok && response.status !== 409) {
    return { slug, error: { code: response.status.toString(), message: await response.text() } }
  }

  return { slug, error: null }
}

export type AutoInstallableExtension = {
  slug: string
  hostSiteUrl: string
  /** npm packages whose presence in `package.json` means the extension should be installed. */
  packages: string[]
}

/** The extensions to install automatically when a site depends on one of their packages. Empty if they can't be fetched. */
export async function fetchAutoInstallableExtensionsMeta(): Promise<AutoInstallableExtension[]> {
  try {
    const url = new URL(`/meta/auto-installable`, process.env['EXTENSION_API_BASE_URL'] ?? EXTENSION_API_BASE_URL)
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch extensions meta`)
    }
    return (await response.json()) as AutoInstallableExtension[]
  } catch (error) {
    console.error(
      `Failed to fetch auto-installable extensions meta: ${error instanceof Error ? error.message : String(error)}`,
      error,
    )
    return []
  }
}
