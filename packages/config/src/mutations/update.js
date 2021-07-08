'use strict'

const { writeFile, unlink } = require('fs')
const { promisify } = require('util')

const pathExists = require('path-exists')

const { ensureConfigPriority } = require('../context')
const { mergeConfigs } = require('../merge')
const { parseOptionalConfig } = require('../parse')
const { addConfigRedirects } = require('../redirects')
const { serializeToml } = require('../utils/toml')

const { applyMutations } = require('./apply')

const pWriteFile = promisify(writeFile)
const pUnlink = promisify(unlink)

// Persist configuration changes to `netlify.toml`.
// If `netlify.toml` does not exist, creates it. Otherwise, merges the changes.
const updateConfig = async function (configMutations, { configPath, redirectsPath, context, branch }) {
  if (configMutations.length === 0) {
    return
  }

  const inlineConfig = applyMutations({}, configMutations)
  const normalizedInlineConfig = ensureConfigPriority(inlineConfig, context, branch)
  const updatedConfig = await mergeWithConfig(normalizedInlineConfig, configPath)
  const finalConfig = await addConfigRedirects(updatedConfig, redirectsPath)
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

module.exports = { updateConfig }
