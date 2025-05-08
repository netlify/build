import { NetlifyAPI } from 'netlify'

import { JIGSAW_URL } from './constants.js'

export type Extension = {
  id: string
  name: string
  slug: string
  hostSiteUrl: string
  installedOnTeam: boolean
}

export const getInstalledExtensionsForSite = async ({
  accountId,
  siteId,
  netlifyToken,
}: {
  accountId: string
  siteId: string
  netlifyToken: string
}) => {
  const url = new URL(
    `${JIGSAW_URL}/team/${encodeURIComponent(accountId)}/integrations/installations/${encodeURIComponent(siteId)}`,
    JIGSAW_URL,
  )
  const extensionsResponse = await fetch(url.toString(), {
    headers: {
      'netlify-token': netlifyToken,
      'Api-Version': '2',
    },
  })
  if (!extensionsResponse.ok) {
    throw new Error(`Failed to fetch extensions`)
  }

  const extensions = (await extensionsResponse.json()) as {
    id: number
    name: string
    integrationId: number
    integrationSlug: string
  }[]

  return extensions
}

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
}: {
  netlifyToken: string
  accountId: string
  slug: string
  hostSiteUrl: string
}): Promise<InstallExtensionResult> => {
  const { data: jigsawToken, error } = await getJigsawToken({
    netlifyToken: netlifyToken,
    accountId,
    integrationSlug: slug,
    isEnable: true,
  })
  if (error || !jigsawToken) {
    return {
      slug,
      error: {
        code: 'FAILED_TO_GET_JIGSAW_TOKEN',
        message: error?.message ?? 'Unknown error',
      },
    }
  }

  const extensionOnInstallUrl = new URL('/.netlify/functions/handler/on-install', hostSiteUrl)
  const installedResponse = await fetch(extensionOnInstallUrl, {
    method: 'POST',
    body: JSON.stringify({
      teamId: accountId,
    }),
    headers: {
      'netlify-token': jigsawToken,
    },
  })

  if (!installedResponse.ok && installedResponse.status !== 409) {
    const text = await installedResponse.text()
    return {
      slug,
      error: {
        code: 'FAILED_TO_INSTALL_EXTENSION',
        message: text,
      },
    }
  }
  return {
    slug,
    error: null,
  }
}

type JigsawTokenResult =
  | {
      data: string
      error: null
    }
  | {
      data: null
      error: { code: number; message: string }
    }

const getJigsawToken = async ({
  netlifyToken,
  accountId,
  integrationSlug,
  isEnable,
}: {
  netlifyToken: string
  accountId: string
  integrationSlug?: string
  /**
   * isEnable will make a token that can install the extension
   */
  isEnable?: boolean
}): Promise<JigsawTokenResult> => {
  try {
    const tokenResponse = await fetch(`${JIGSAW_URL}/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `_nf-auth=${netlifyToken}`,
        'Api-Version': '2',
      },
      body: JSON.stringify({
        ownerId: accountId,
        integrationSlug,
        isEnable,
      }),
    })

    if (!tokenResponse.ok) {
      return {
        data: null,
        error: {
          code: 401,
          message: `Unauthorized`,
        },
      }
    }

    const tokenData = (await tokenResponse.json()) as { token?: string } | undefined

    if (!tokenData?.token) {
      return {
        data: null,
        error: {
          code: 401,
          message: `Unauthorized`,
        },
      }
    }
    return {
      data: tokenData.token,
      error: null,
    }
  } catch (e) {
    console.error('Failed to get Jigsaw token', e)
    return {
      data: null,
      error: {
        code: 401,
        message: `Unauthorized`,
      },
    }
  }
}

export const getExtension = async ({
  accountId,
  netlifyToken,
  slug,
}: {
  accountId: string
  netlifyToken: string
  slug: string
}) => {
  const extensionResponse = await fetch(
    `${JIGSAW_URL}/${encodeURIComponent(accountId)}/integrations/${encodeURIComponent(slug)}`,
    {
      headers: {
        'netlify-token': netlifyToken,
        'Api-Version': '2',
      },
    },
  )
  if (!extensionResponse.ok) {
    throw new Error(`Failed to fetch extension: ${slug}`)
  }

  const extension = (await extensionResponse.json()) as Extension | undefined

  return extension
}

// temporary getAccount with correct types
// This can be removed when the netlify api getAccount return type is fixed.
export const getAccount = async (
  api: NetlifyAPI,
  {
    accountId,
  }: {
    accountId: string
  },
) => {
  let account: Awaited<ReturnType<typeof api.getAccount>>[number]
  try {
    // @ts-expect-error -- TODO: fix the getAccount type in the openapi spec. It should not be an array of accounts, just one account.
    account = await api.getAccount({ accountId })
  } catch (e) {
    throw new Error(`Error getting account, make sure you are logged in with netlify login`, {
      cause: e,
    })
  }
  if (!account.id || !account.name) {
    throw new Error(`Error getting account, make sure you are logged in with netlify login`)
  }
  return account as { id: string; name: string } & Omit<
    Awaited<ReturnType<typeof api.getAccount>>[number],
    'id' | 'name'
  >
}
