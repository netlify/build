'use strict'

const { writeFile, unlink } = require('fs')
const { promisify } = require('util')

const cpFile = require('cp-file')
const makeDir = require('make-dir')
const pathExists = require('path-exists')

const { ensureConfigPriority } = require('../context')
const { mergeConfigs } = require('../merge')
const { parseOptionalConfig } = require('../parse')
const { addConfigRedirects } = require('../redirects')
const { simplifyConfig } = require('../simplify')
const { serializeToml } = require('../utils/toml')

const { applyMutations } = require('./apply')

const pWriteFile = promisify(writeFile)
const pUnlink = promisify(unlink)

// Persist configuration changes to `netlify.toml`.
// If `netlify.toml` does not exist, creates it. Otherwise, merges the changes.
const updateConfig = async function (configMutations, { buildDir, configPath, redirectsPath, context, branch }) {
  if (configMutations.length === 0) {
    return
  }

  const inlineConfig = applyMutations({}, configMutations)
  const normalizedInlineConfig = ensureConfigPriority(inlineConfig, context, branch)
  const updatedConfig = await mergeWithConfig(normalizedInlineConfig, configPath)
  const finalConfig = await addConfigRedirects(updatedConfig, redirectsPath)
  const simplifiedConfig = simplifyConfig(finalConfig)
  await backupConfig({ buildDir, configPath, redirectsPath })
  await Promise.all([
    saveConfig(configPath, simplifiedConfig),
    deleteRedirectsFile(redirectsPath, normalizedInlineConfig),
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
  await pWriteFile(configPath, serializedConfig)
}

// Deletes `_redirects` if redirects were changed, since `_redirects` has higher
// priority than `netlify.toml`.
const deleteRedirectsFile = async function (redirectsPath, normalizedInlineConfig) {
  if (
    normalizedInlineConfig.redirects === undefined ||
    redirectsPath === undefined ||
    !(await pathExists(redirectsPath))
  ) {
    return
  }

  await pUnlink(redirectsPath)
}

// Modifications to `netlify.toml` and `_redirects` are only meant for the
// deploy API call. After it's been performed, we restore their former state.
// We do this by backing them up inside some sibling directory.
const backupConfig = async function ({ buildDir, configPath, redirectsPath }) {
  const tempDir = getTempDir(buildDir)
  await makeDir(tempDir)
  await Promise.all([
    backupFile(configPath, `${tempDir}/netlify.toml`),
    backupFile(redirectsPath, `${tempDir}/_redirects`),
  ])
}

const restoreConfig = async function ({ buildDir, configPath, redirectsPath }) {
  const tempDir = getTempDir(buildDir)
  await Promise.all([
    copyOrDelete(`${tempDir}/netlify.toml`, configPath),
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

  await cpFile(original, backup)
}

const deleteNoError = async (path) => {
  try {
    await pUnlink(path)
  } catch (_) {}
}

const copyOrDelete = async function (src, dest) {
  if (await pathExists(src)) {
    await cpFile(src, dest)
    return
  }

  await deleteNoError(dest)
}

module.exports = { updateConfig, restoreConfig }
