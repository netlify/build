import { existsSync, promises as fs } from 'fs'

import { readOptionalConfigFile } from './file.js'
import { mergeHeaders, mergeRedirects } from './headers_redirects.js'
import { mergeConfigs } from './merge.js'
import { applyMutations } from './mutations.js'
import { spreadValue } from './normalize_values.js'
import { simplifyConfig } from './simplify.js'
import { serializeToml } from './toml.js'
import type { ConfigMutation, Logs, RawConfig } from './types.js'

export interface UpdateConfigOptions {
  buildDir: string
  configPath?: string | undefined
  /** Where to write the updated `netlify.toml`. Defaults to `configPath`. */
  outputConfigPath?: string | undefined
  headersPath?: string | undefined
  redirectsPath?: string | undefined
  context: string
  branch: string
  logs?: Logs | undefined
}

type SiteFiles = Pick<UpdateConfigOptions, 'buildDir' | 'configPath' | 'headersPath' | 'redirectsPath'>

/**
 * Persist mutations into `netlify.toml`, ahead of context-specific properties, merging `_headers`
 * and `_redirects` into it, after backing up the site files. Unknown options are ignored.
 */
export const updateConfig = async function (
  mutations: readonly ConfigMutation[],
  options: UpdateConfigOptions,
): Promise<void> {
  if (mutations.length === 0) {
    return
  }

  const { configPath, outputConfigPath = configPath, headersPath, redirectsPath, context, branch, logs } = options
  const mutated = prioritizeOverContexts(applyMutations({}, mutations), context, branch)
  const fileConfig = configPath === undefined ? {} : await readOptionalConfigFile(configPath)
  const merged = mergeConfigs<RawConfig>([fileConfig, mutated])
  const headers = await mergeHeaders(merged['headers'], { headersPath, logs })
  const redirects = await mergeRedirects(merged['redirects'], { redirectsPath, logs })
  const simplified = simplifyConfig({ ...merged, headers, redirects })

  await backUpSiteFiles(options)
  // Serialized after the backup: when it throws, the backup is made but nothing is written or deleted.
  const toml = serializeToml(simplified)
  // The side files are now part of `netlify.toml`, so they are deleted even if no mutation concerned them.
  await Promise.all([writeFile(outputConfigPath, toml), deleteIfExists(headersPath), deleteIfExists(redirectsPath)])
}

// Also written as an entry for the current context and branch, to win over the file's entries. The
// entry has build properties at its top level too, like in `netlify.toml`, but not `redirects`.
const prioritizeOverContexts = function (
  { build = {}, ...config }: RawConfig,
  context: string,
  branch: string,
): RawConfig {
  const { redirects: _redirects, ...entryConfig } = config
  const entry = { ...entryConfig, ...spreadValue(build), build }
  return { ...config, build, context: { ...spreadValue(config['context']), [context]: entry, [branch]: entry } }
}

/** Put back the site files `updateConfig` backed up, deleting those that had no backup. */
export const restoreConfig = async function (mutations: readonly ConfigMutation[], options: SiteFiles): Promise<void> {
  if (mutations.length === 0) {
    return
  }

  const { buildDir, configPath, headersPath, redirectsPath } = options
  const backupDir = getBackupDir(buildDir)
  await Promise.all([
    restoreFile(`${backupDir}/netlify.toml`, configPath),
    restoreFile(`${backupDir}/_headers`, headersPath),
    restoreFile(`${backupDir}/_redirects`, redirectsPath),
  ])
}

const getBackupDir = (buildDir: string) => `${buildDir}/.netlify/deploy`

const backUpSiteFiles = async function ({ buildDir, configPath, headersPath, redirectsPath }: SiteFiles) {
  const backupDir = getBackupDir(buildDir)
  await fs.mkdir(backupDir, { recursive: true })
  await Promise.all([
    backUpFile(configPath, `${backupDir}/netlify.toml`),
    backUpFile(headersPath, `${backupDir}/_headers`),
    backUpFile(redirectsPath, `${backupDir}/_redirects`),
  ])
}

// A stale backup from a previous build is removed even when there is nothing to back up.
const backUpFile = async function (original: string | undefined, backup: string) {
  await deleteIgnoringErrors(backup)
  if (original !== undefined && existsSync(original)) {
    await fs.copyFile(original, backup)
  }
}

// Without a backup, the file didn't exist before `updateConfig`.
const restoreFile = async function (backup: string, destination: string | undefined) {
  if (destination === undefined) {
    return
  }

  if (existsSync(backup)) {
    await fs.copyFile(backup, destination)
    return
  }

  await deleteIgnoringErrors(destination)
}

const writeFile = async function (path: string | undefined, content: string) {
  if (path === undefined) {
    throw new TypeError('updateConfig() needs configPath or outputConfigPath')
  }

  await fs.writeFile(path, content)
}

const deleteIfExists = async function (path: string | undefined) {
  if (path !== undefined && existsSync(path)) {
    await fs.unlink(path)
  }
}

const deleteIgnoringErrors = async function (path: string) {
  try {
    await fs.unlink(path)
  } catch {
    // The file may not exist.
  }
}
