import { createRequire } from 'node:module'

import * as z from 'zod'

import { throwUserError } from './error.js'
import type { ResolvedOptions } from './options.js'
import type { Extension } from './types.js'

const PRODUCTION_API_HOSTNAME = 'api.netlify.com'
const STAGING_API_HOSTNAME = 'api-staging.netlify.com'
export const PRODUCTION_BASE_URL = 'https://api.netlifysdk.com'
const STAGING_BASE_URL = 'https://api-staging.netlifysdk.com'

export const ERROR_CALL_TO_ACTION = `Double-check your login status with 'netlify status' or contact support with details of your error.`

const packageJson = z.object({ version: z.string() }).parse(createRequire(import.meta.url)('../package.json'))

export const getUserAgent = (mode: string) => `Netlify Config (mode:${mode}) / ${packageJson.version}`

// Unknown properties, such as `has_connector`, are stripped.
const extensionsSchema = z.array(
  z.object({
    author: z.string().optional(),
    extension_token: z.string().optional(),
    has_build: z.boolean(),
    name: z.string(),
    slug: z.string(),
    version: z.string(),
  }),
)

export const fetchExtensions = async function (options: ResolvedOptions): Promise<Extension[]> {
  const { siteId, offline } = options
  if (!siteId || offline) {
    return []
  }

  // Built outside the `try`: an invalid URL or header is a bug, not a failed request.
  const url = getExtensionsUrl(options, siteId)
  const headers = getHeaders(options)
  try {
    const response = await fetch(url, { headers })
    if (response.status !== 200) {
      throw new Error(`Unexpected status code ${String(response.status)} from fetching extensions`)
    }
    return extensionsSchema.parse(await response.json())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    throwUserError(`Failed retrieving extensions for site ${siteId}: ${message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getExtensionsUrl = function ({ accountId, testOpts, host }: ResolvedOptions, siteId: string): string {
  const baseUrl = new URL(testOpts.host ? getTestBaseUrl(testOpts.host) : getBaseUrl(host)).href
  // Without an account ID, the older site-level endpoint is used.
  return accountId
    ? `${baseUrl}team/${accountId}/integrations/installations/meta/${siteId}`
    : `${baseUrl}site/${siteId}/integrations/safe`
}

const getBaseUrl = (host: string | undefined) =>
  host?.includes(STAGING_API_HOSTNAME) ? STAGING_BASE_URL : PRODUCTION_BASE_URL

// A test host is the staging or production API, or a local test server.
const getTestBaseUrl = function (testHost: string): string {
  if (testHost.includes(STAGING_API_HOSTNAME)) {
    return STAGING_BASE_URL
  }
  if (testHost.includes(PRODUCTION_API_HOSTNAME)) {
    return PRODUCTION_BASE_URL
  }
  return `http://${testHost}`
}

const getHeaders = function ({ mode, token, featureFlags }: ResolvedOptions): Headers {
  const headers = new Headers({ 'Netlify-Config-Mode': mode, 'User-Agent': getUserAgent(mode) })
  if (featureFlags['send_build_bot_token_to_jigsaw'] && token) {
    headers.set('Netlify-SDK-Build-Bot-Token', token)
  }
  return headers
}
