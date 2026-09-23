import { promises as fs } from 'fs'

import type { NetlifyAPI } from '@netlify/api'
import isPlainObj from 'is-plain-obj'
import * as z from 'zod'

import { accountsSchema, siteSchema } from './api/schemas.js'
import type { ExtensionWithDev } from './types/api.js'
import type { ResolvedNetlifyConfig } from './types/config.js'
import type { BufferedLogs, Logs } from './types/logs.js'
import type { Config } from './types/result.js'
import { parseLeniently } from './utils/schema.js'

type CachedConfigOptions = {
  cachedConfig: Config | undefined
  cachedConfigPath: string | undefined
  token: string | undefined
  api: NetlifyAPI | undefined
  logs: Logs | undefined
}

// A previous result of this package, so nested values are only checked to be objects.
const cachedConfigSchema: z.ZodType<Config> = z.looseObject({
  accounts: accountsSchema,
  branch: z.string(),
  buildDir: z.string(),
  config: z.custom<ResolvedNetlifyConfig>(isPlainObj),
  configPath: z.string().optional(),
  context: z.string(),
  env: z.record(
    z.string(),
    z.object({
      sources: z.array(z.enum(['configFile', 'ui', 'account', 'general', 'internal'])),
      value: z.string(),
    }),
  ),
  headersPath: z.string(),
  integrations: z.array(z.custom<ExtensionWithDev>(isPlainObj)),
  logs: z.custom<BufferedLogs>(isPlainObj).optional(),
  redirectsPath: z.string(),
  repositoryRoot: z.string(),
  siteInfo: siteSchema,
  token: z.string().optional(),
})

/**
 * A previous result of `resolveConfig`, if given, to skip resolving again. The buildbot resolves
 * the config, then runs `@netlify/build`, which resolves it again; netlify-cli does this too.
 * `token` and `api` are not in the serialized result, so the caller passes them again.
 */
export const getCachedConfig = async function ({
  cachedConfig,
  cachedConfigPath,
  token,
  api,
  logs,
}: CachedConfigOptions): Promise<Config | undefined> {
  const rawCachedConfig = await readCachedConfig(cachedConfig, cachedConfigPath)
  if (rawCachedConfig === undefined) {
    return undefined
  }

  const parsedCachedConfig = parseLeniently(cachedConfigSchema, rawCachedConfig, { description: 'cached config', logs })
  return { token, ...parsedCachedConfig, api }
}

// `cachedConfig` is used programmatically. The binary uses `cachedConfigPath`, since a large
// config could exceed the OS limit on command line length.
const readCachedConfig = async function (
  cachedConfig: Config | undefined,
  cachedConfigPath: string | undefined,
): Promise<unknown> {
  if (cachedConfig !== undefined) {
    return cachedConfig
  }

  if (cachedConfigPath !== undefined) {
    return JSON.parse(await fs.readFile(cachedConfigPath, 'utf8'))
  }

  return undefined
}
