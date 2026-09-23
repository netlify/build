import { promises as fs } from 'fs'

import type { NetlifyAPI } from '@netlify/api'

import type { Config } from './types/result.js'

type CachedConfigOptions = {
  cachedConfig: Config | undefined
  cachedConfigPath: string | undefined
  token: string | undefined
  api: NetlifyAPI | undefined
}

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
}: CachedConfigOptions): Promise<Config | undefined> {
  const parsedCachedConfig = await parseCachedConfig(cachedConfig, cachedConfigPath)
  return parsedCachedConfig === undefined ? undefined : { token, ...parsedCachedConfig, api }
}

// `cachedConfig` is used programmatically. The binary uses `cachedConfigPath`, since a large
// config could exceed the OS limit on command line length.
const parseCachedConfig = async function (cachedConfig: Config | undefined, cachedConfigPath: string | undefined) {
  if (cachedConfig !== undefined) {
    return cachedConfig
  }

  if (cachedConfigPath !== undefined) {
    return JSON.parse(await fs.readFile(cachedConfigPath, 'utf8')) as Config
  }

  return undefined
}
