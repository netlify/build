'use strict'

// @todo: use `util.isDeepStrictEqual()` after dropping support for Node 8
const fastDeepEqual = require('fast-deep-equal')
const pFilter = require('p-filter')
const pathExists = require('path-exists')

const { resolveUpdatedConfig } = require('../core/config')
const { addErrorInfo } = require('../error/info')
const { logConfigMutations, logConfigOnUpdate } = require('../log/messages/config')

// If `netlifyConfig` was updated or `_redirects` was created, the configuration
// is updated by calling `@netlify/config` again.
const updateNetlifyConfig = async function ({
  configOpts,
  netlifyConfig,
  redirectsPath,
  configMutations,
  newConfigMutations,
  configSideFiles,
  errorParams,
  logs,
  debug,
}) {
  if (!(await shouldUpdateConfig({ newConfigMutations, configSideFiles, redirectsPath }))) {
    return { netlifyConfig, configMutations }
  }

  validateConfigMutations(newConfigMutations)
  logConfigMutations(logs, newConfigMutations)
  const configMutationsA = [...configMutations, ...newConfigMutations]
  const { config: netlifyConfigA, redirectsPath: redirectsPathA } = await resolveUpdatedConfig(
    configOpts,
    configMutationsA,
  )
  logConfigOnUpdate({ logs, netlifyConfig: netlifyConfigA, debug })
  // eslint-disable-next-line fp/no-mutation,no-param-reassign
  errorParams.netlifyConfig = netlifyConfigA
  return { netlifyConfig: netlifyConfigA, configMutations: configMutationsA, redirectsPath: redirectsPathA }
}

const shouldUpdateConfig = async function ({ newConfigMutations, configSideFiles, redirectsPath }) {
  return newConfigMutations.length !== 0 || (await haveConfigSideFilesChanged(configSideFiles, redirectsPath))
}

// The configuration mostly depends on `netlify.toml` and UI build settings.
// However, it also uses some additional optional side files like `_redirects`.
// Those are often created by the build command. When those are created, we need
// to update the configuration. We detect this by checking for file existence
// before and after running plugins and the build command.
const haveConfigSideFilesChanged = async function (configSideFiles, redirectsPath) {
  const newSideFiles = await listConfigSideFiles(redirectsPath)
  return !fastDeepEqual(newSideFiles, configSideFiles)
}

// List all the files used for configuration besides `netlify.toml`.
// This is useful when applying configuration mutations since those files
// sometimes have higher priority and should therefore be deleted in order to
// apply any configuration update on `netlify.toml`.
const listConfigSideFiles = async function (redirectsPath) {
  const configSideFiles = await pFilter([redirectsPath], pathExists)
  // eslint-disable-next-line fp/no-mutating-methods
  return configSideFiles.sort()
}

// Validate each new configuration change
const validateConfigMutations = function (newConfigMutations) {
  try {
    newConfigMutations.forEach(validateConfigMutation)
  } catch (error) {
    addErrorInfo(error, { type: 'pluginValidation' })
    throw error
  }
}

const validateConfigMutation = function ({ keysString, keys, value }) {
  forbidArrayElementAssign(keys, keysString)
  forbidEmptyAssign(value, keysString)
}

const forbidArrayElementAssign = function (keys, keyString) {
  const key = keys[keys.length - 1]
  const index = typeof key === 'string' ? Number(key) : key
  const isArrayIndex = Number.isInteger(index)
  if (isArrayIndex) {
    throw new Error(`Setting "netlifyConfig.${keyString}" individual array element is not allowed.
Please set the full array instead.`)
  }
}

// Triggered when calling `netlifyConfig.{key} = undefined | null`
// We do not allow this because the back-end only receives mutations as a
// `netlify.toml`, i.e. cannot apply property deletions since `undefined` is
// not serializable in TOML.
const forbidEmptyAssign = function (value, keysString) {
  if (value === undefined || value === null) {
    throw new Error(`Setting "netlifyConfig.${keysString}" to ${value} is not allowed.
Please set this property to a specific value instead.`)
  }
}

module.exports = { updateNetlifyConfig, listConfigSideFiles }
