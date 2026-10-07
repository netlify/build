import { readFile } from 'node:fs/promises'

import type { NetlifyAPI } from '@netlify/api'
import isPlainObj from 'is-plain-obj'
import * as z from 'zod'

import { accountSchema, siteSchema } from './api.js'
import type { ResolvedOptions } from './options.js'
import type { BufferedLogs, Config, Integration, NetlifyConfig } from './types.js'
import { parseLeniently } from './validate/lenient.js'

// A previous result of this package, so nested values are only checked to be objects.
const cachedConfigSchema: z.ZodType<Config> = z.looseObject({
  accounts: z.array(accountSchema),
  branch: z.string(),
  buildDir: z.string(),
  config: z.custom<NetlifyConfig>(isPlainObj),
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
  // From JSON, `buildPlugin.packageURL` is a string: it's only recomputed when resolving again.
  integrations: z.array(z.custom<Integration>(isPlainObj)),
  logs: z.custom<BufferedLogs>(isPlainObj).optional(),
  redirectsPath: z.string(),
  repositoryRoot: z.string(),
  siteInfo: siteSchema,
  token: z.string().optional(),
})

// Reading or parsing `cachedConfigPath` fails with the raw error, which is not a user error.
export const readCachedConfig = async function ({
  cachedConfig,
  cachedConfigPath,
  logs,
}: ResolvedOptions): Promise<Config | undefined> {
  const rawCachedConfig = await readRawCachedConfig(cachedConfig, cachedConfigPath)
  if (rawCachedConfig === undefined) {
    return undefined
  }
  return parseLeniently(cachedConfigSchema, rawCachedConfig, { description: 'cached config', logs })
}

// The binary uses `cachedConfigPath`, since a large config could exceed the command line length limit.
const readRawCachedConfig = async function (
  cachedConfig: unknown,
  cachedConfigPath: string | undefined,
): Promise<unknown> {
  if (cachedConfig !== undefined) {
    return cachedConfig
  }
  if (cachedConfigPath === undefined) {
    return undefined
  }
  return JSON.parse(await readFile(cachedConfigPath, 'utf8'))
}

export const getCachedResult = function (
  cached: Config,
  options: ResolvedOptions,
  api: NetlifyAPI | undefined,
): Config {
  // QUIRK: a cached `token` and `logs` win, so this call's buffered logs are not returned.
  return { token: options.token, ...cached, api }
}
