import { existsSync, promises as fs } from 'fs'

import { ensureConfigPriority } from '../context.js'
import { addHeaders } from '../headers.js'
import { mergeConfigs } from '../merge.js'
import { parseOptionalConfig } from '../parse.js'
import { addRedirects } from '../redirects.js'
import { simplifyConfig } from '../simplify.js'
import type { PartialNetlifyConfig } from '../types/config.js'
import type { Logs } from '../types/logs.js'
import type { ConfigMutation } from '../types/mutations.js'
import { serializeToml } from '../utils/toml.js'

import { applyMutations } from './apply.js'

type SiteFiles = {
  buildDir: string
  /** The site's `netlify.toml`, which may not exist. */
  configPath?: string
  /** The site's `_headers` file, which may not exist. */
  headersPath?: string
  /** The site's `_redirects` file, which may not exist. */
  redirectsPath?: string
}

type UpdateConfigOptions = SiteFiles & {
  /** Where to write the updated `netlify.toml`. Defaults to `configPath`. */
  outputConfigPath?: string
  context: string
  branch: string
  logs?: Logs
}

/**
 * Write config mutations to `netlify.toml`, merged with its current content, taking priority over
 * its context-specific properties. `_headers` and `_redirects` are merged into it too and deleted,
 * so their priority relative to `netlify.toml` doesn't matter. The previous files are backed up
 * for `restoreConfig`.
 */
export const updateConfig = async function (
  configMutations: ConfigMutation[],
  {
    buildDir,
    configPath,
    headersPath,
    outputConfigPath = configPath,
    redirectsPath,
    context,
    branch,
    logs,
  }: UpdateConfigOptions,
): Promise<void> {
  if (configMutations.length === 0) {
    return
  }

  const inlineConfig = ensureConfigPriority(applyMutations({}, configMutations), context, branch)
  const fileConfig = configPath === undefined ? {} : await parseOptionalConfig(configPath)
  const mergedConfig = mergeConfigs<PartialNetlifyConfig>([fileConfig, inlineConfig])
  const withHeaders = await addHeaders({ config: mergedConfig, headersPath, logs })
  const withRedirects = await addRedirects({ config: withHeaders, redirectsPath, logs })
  const simplifiedConfig = simplifyConfig(withRedirects)

  await backupSiteFiles({ buildDir, configPath, headersPath, redirectsPath })
  await Promise.all([
    // Without either path, this throws, as it always has.
    fs.writeFile(outputConfigPath!, serializeToml(simplifiedConfig)),
    deleteIfExists(headersPath),
    deleteIfExists(redirectsPath),
  ])
}

/**
 * Put back the files `updateConfig` changed. Their changes are only meant for the deploy API
 * call, which happens in between.
 */
export const restoreConfig = async function (
  configMutations: ConfigMutation[],
  { buildDir, configPath, headersPath, redirectsPath }: SiteFiles,
): Promise<void> {
  if (configMutations.length === 0) {
    return
  }

  const backupDir = getBackupDir(buildDir)
  await Promise.all([
    restoreFile(`${backupDir}/netlify.toml`, configPath),
    restoreFile(`${backupDir}/_headers`, headersPath),
    restoreFile(`${backupDir}/_redirects`, redirectsPath),
  ])
}

const getBackupDir = (buildDir: string) => `${buildDir}/.netlify/deploy`

const backupSiteFiles = async function ({ buildDir, configPath, headersPath, redirectsPath }: SiteFiles) {
  const backupDir = getBackupDir(buildDir)
  await fs.mkdir(backupDir, { recursive: true })
  await Promise.all([
    backupFile(configPath, `${backupDir}/netlify.toml`),
    backupFile(headersPath, `${backupDir}/_headers`),
    backupFile(redirectsPath, `${backupDir}/_redirects`),
  ])
}

// A stale backup from a previous build is removed even when there's nothing to back up.
const backupFile = async function (original: string | undefined, backup: string) {
  await deleteIgnoringErrors(backup)
  if (original === undefined || !existsSync(original)) {
    return
  }

  await fs.copyFile(original, backup)
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

const deleteIfExists = async function (path: string | undefined) {
  if (path === undefined || !existsSync(path)) {
    return
  }

  await fs.unlink(path)
}

const deleteIgnoringErrors = async function (path: string) {
  try {
    await fs.unlink(path)
  } catch {
    // The file may not exist.
  }
}
