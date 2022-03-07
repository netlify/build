import { promises as fs } from 'fs'

import { pathExists } from 'path-exists'

import { ensureConfigPriority } from '../context.js'
import { addHeaders } from '../headers.js'
import { mergeConfigs } from '../merge.js'
import { parseOptionalConfig } from '../parse.js'
import { addRedirects } from '../redirects.js'
import { simplifyConfig } from '../simplify.js'
import { serializeToml } from '../utils/toml.js'

import { applyMutations } from './apply.js'

// Persist configuration changes to `netlify.toml`.
// If `netlify.toml` does not exist, creates it. Otherwise, merges the changes.
export const updateConfig = async function (
  configMutations,
  { buildDir, configPath, headersPath, redirectsPath, context, branch, logs, featureFlags },
) {
  if (configMutations.length === 0) {
    return
  }

  const inlineConfig = applyMutations({}, configMutations)
  const normalizedInlineConfig = ensureConfigPriority(inlineConfig, context, branch)
  const updatedConfig = await mergeWithConfig(normalizedInlineConfig, configPath)
  const configWithHeaders = await addHeaders({ config: updatedConfig, headersPath, logs, featureFlags })
  const finalConfig = await addRedirects({ config: configWithHeaders, redirectsPath, logs, featureFlags })
  const simplifiedConfig = simplifyConfig(finalConfig)
  await backupConfig({ buildDir, configPath, headersPath, redirectsPath })
  await Promise.all([
    saveConfig(configPath, simplifiedConfig),
    deleteSideFile(headersPath),
    deleteSideFile(redirectsPath),
  ])
}

// If `netlify.toml` exists, deeply merges the configuration changes.
const mergeWithConfig = async function (normalizedInlineConfig, configPath) {
  const config = await parseOptionalConfig(configPath)
  const updatedConfig = mergeConfigs([config, normalizedInlineConfig])
  return updatedConfig
}

// Serialize the changes to `netlify.toml`
const saveConfig = async function (configPath, simplifiedConfig) {
  const serializedConfig = serializeToml(simplifiedConfig)
  await fs.writeFile(configPath, serializedConfig)
}

// Deletes `_headers/_redirects` since they are merged to `netlify.toml`,
// to fix any priority problem.
const deleteSideFile = async function (filePath) {
  if (filePath === undefined || !(await pathExists(filePath))) {
    return
  }

  await fs.unlink(filePath)
}

// Modifications to `netlify.toml` and `_headers/_redirects` are only meant for
// the deploy API call. After it's been performed, we restore their former
// state.
// We do this by backing them up inside some sibling directory.
const backupConfig = async function ({ buildDir, configPath, headersPath, redirectsPath }) {
  const tempDir = getTempDir(buildDir)
  await fs.mkdir(tempDir, { recursive: true })
  await Promise.all([
    backupFile(configPath, `${tempDir}/netlify.toml`),
    backupFile(headersPath, `${tempDir}/_headers`),
    backupFile(redirectsPath, `${tempDir}/_redirects`),
  ])
}

export const restoreConfig = async function (configMutations, { buildDir, configPath, headersPath, redirectsPath }) {
  if (configMutations.length === 0) {
    return
  }

  const tempDir = getTempDir(buildDir)
  await Promise.all([
    copyOrDelete(`${tempDir}/netlify.toml`, configPath),
    copyOrDelete(`${tempDir}/_headers`, headersPath),
    copyOrDelete(`${tempDir}/_redirects`, redirectsPath),
  ])
}

const getTempDir = function (buildDir) {
  return `${buildDir}/.netlify/deploy`
}

const backupFile = async function (original, backup) {
  // this makes sure we don't restore stale files
  await deleteNoError(backup)

  if (!(await pathExists(original))) {
    return
  }

  await fs.copyFile(original, backup)
}

const deleteNoError = async (path) => {
  try {
    await fs.unlink(path)
  } catch {}
}

const copyOrDelete = async function (src, dest) {
  if (await pathExists(src)) {
    await fs.copyFile(src, dest)
    return
  }

  await deleteNoError(dest)
}
