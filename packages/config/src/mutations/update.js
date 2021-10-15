'use strict'

const { writeFile, unlink, copyFile } = require('fs')
const { promisify } = require('util')

const makeDir = require('make-dir')
const pathExists = require('path-exists')

const { ensureConfigPriority } = require('../context')
const { addHeaders } = require('../headers')
const { mergeConfigs } = require('../merge')
const { parseOptionalConfig } = require('../parse')
const { addRedirects } = require('../redirects')
const { simplifyConfig } = require('../simplify')
const { serializeToml } = require('../utils/toml')

const { applyMutations } = require('./apply')

const pWriteFile = promisify(writeFile)
const pUnlink = promisify(unlink)
const pCopyFile = promisify(copyFile)

// Persist configuration changes to `netlify.toml`.
// If `netlify.toml` does not exist, creates it. Otherwise, merges the changes.
const updateConfig = async function (
  configMutations,
  { buildDir, configPath, headersPath, redirectsPath, context, branch, logs },
) {
  if (configMutations.length === 0) {
    return
  }

  const inlineConfig = applyMutations({}, configMutations)
  const normalizedInlineConfig = ensureConfigPriority(inlineConfig, context, branch)
  const updatedConfig = await mergeWithConfig(normalizedInlineConfig, configPath)
  const configWithHeaders = await addHeaders(updatedConfig, headersPath, logs)
  const finalConfig = await addRedirects(configWithHeaders, redirectsPath, logs)
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
  await pWriteFile(configPath, serializedConfig)
}

// Deletes `_headers/_redirects` since they are merged to `netlify.toml`,
// to fix any priority problem.
const deleteSideFile = async function (filePath) {
  if (filePath === undefined || !(await pathExists(filePath))) {
    return
  }

  await pUnlink(filePath)
}

// Modifications to `netlify.toml` and `_headers/_redirects` are only meant for
// the deploy API call. After it's been performed, we restore their former
// state.
// We do this by backing them up inside some sibling directory.
const backupConfig = async function ({ buildDir, configPath, headersPath, redirectsPath }) {
  const tempDir = getTempDir(buildDir)
  await makeDir(tempDir)
  await Promise.all([
    backupFile(configPath, `${tempDir}/netlify.toml`),
    backupFile(headersPath, `${tempDir}/_headers`),
    backupFile(redirectsPath, `${tempDir}/_redirects`),
  ])
}

const restoreConfig = async function (configMutations, { buildDir, configPath, headersPath, redirectsPath }) {
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

  await pCopyFile(original, backup)
}

const deleteNoError = async (path) => {
  try {
    await pUnlink(path)
  } catch (_) {}
}

const copyOrDelete = async function (src, dest) {
  if (await pathExists(src)) {
    await pCopyFile(src, dest)
    return
  }

  await deleteNoError(dest)
}

module.exports = { updateConfig, restoreConfig }
