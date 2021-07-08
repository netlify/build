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
  const simplifiedConfig = simplifyConfig(inlineConfig)
  const normalizedInlineConfig = ensureConfigPriority(simplifiedConfig, context, branch)
  const updatedConfig = await mergeWithConfig(normalizedInlineConfig, configPath)
  const finalConfig = await addConfigRedirects(updatedConfig, redirectsPath)
  await backupConfig({ buildDir, configPath, redirectsPath })
  await Promise.all([saveConfig(configPath, finalConfig), deleteRedirectsFile(redirectsPath, normalizedInlineConfig)])
}

// If `netlify.toml` exists, deeply merges the configuration changes.
const mergeWithConfig = async function (normalizedInlineConfig, configPath) {
  const config = await parseOptionalConfig(configPath)
  const updatedConfig = mergeConfigs([config, normalizedInlineConfig])
  return updatedConfig
}

// Serialize the changes to `netlify.toml`
const saveConfig = async function (configPath, finalConfig) {
  const serializedConfig = serializeToml(finalConfig)
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
    copyIfExists(configPath, `${tempDir}/netlify.toml`),
    copyIfExists(redirectsPath, `${tempDir}/_redirects`),
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

const copyIfExists = async function (src, dest) {
  if (!(await pathExists(src))) {
    return
  }

  await cpFile(src, dest)
}

const copyOrDelete = async function (src, dest) {
  if (await pathExists(src)) {
    await cpFile(src, dest)
    return
  }

  if (await pathExists(dest)) {
    await pUnlink(dest)
  }
}

module.exports = { updateConfig, restoreConfig }
