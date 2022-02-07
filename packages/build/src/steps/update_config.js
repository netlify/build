import { isDeepStrictEqual } from 'util'

import pFilter from 'p-filter'
import { pathExists } from 'path-exists'

import { resolveUpdatedConfig } from '../core/config.js'
import { addErrorInfo } from '../error/info.js'
import { logConfigOnUpdate } from '../log/messages/config.js'
import { logConfigMutations } from '../log/messages/mutations.js'

// If `netlifyConfig` was updated or `_redirects` was created, the configuration
// is updated by calling `@netlify/config` again.
export const updateNetlifyConfig = async function ({
  configOpts,
  netlifyConfig,
  headersPath,
  redirectsPath,
  configMutations,
  newConfigMutations,
  configSideFiles,
  errorParams,
  logs,
  debug,
}) {
  if (!(await shouldUpdateConfig({ newConfigMutations, configSideFiles, headersPath, redirectsPath }))) {
    return { netlifyConfig, configMutations }
  }

  validateConfigMutations(newConfigMutations)
  logConfigMutations(logs, newConfigMutations, debug)
  const configMutationsA = [...configMutations, ...newConfigMutations]
  const {
    config: netlifyConfigA,
    headersPath: headersPathA,
    redirectsPath: redirectsPathA,
  } = await resolveUpdatedConfig(configOpts, configMutationsA)
  logConfigOnUpdate({ logs, netlifyConfig: netlifyConfigA, debug })
  // eslint-disable-next-line fp/no-mutation,no-param-reassign
  errorParams.netlifyConfig = netlifyConfigA
  return {
    netlifyConfig: netlifyConfigA,
    configMutations: configMutationsA,
    headersPath: headersPathA,
    redirectsPath: redirectsPathA,
  }
}

const shouldUpdateConfig = async function ({ newConfigMutations, configSideFiles, headersPath, redirectsPath }) {
  return (
    newConfigMutations.length !== 0 || (await haveConfigSideFilesChanged(configSideFiles, headersPath, redirectsPath))
  )
}

// The configuration mostly depends on `netlify.toml` and UI build settings.
// However, it also uses some additional optional side files like `_redirects`.
// Those are often created by the build command. When those are created, we need
// to update the configuration. We detect this by checking for file existence
// before and after running plugins and the build command.
const haveConfigSideFilesChanged = async function (configSideFiles, headersPath, redirectsPath) {
  const newSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
  return !isDeepStrictEqual(newSideFiles, configSideFiles)
}

// List all the files used for configuration besides `netlify.toml`.
// This is useful when applying configuration mutations since those files
// sometimes have higher priority and should therefore be deleted in order to
// apply any configuration update on `netlify.toml`.
export const listConfigSideFiles = async function (sideFiles) {
  const configSideFiles = await pFilter(sideFiles, pathExists)
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

// Triggered when calling `netlifyConfig.{key} = undefined | null`
// We do not allow this because the back-end only receives mutations as a
// `netlify.toml`, i.e. cannot apply property deletions since `undefined` is
// not serializable in TOML.
const validateConfigMutation = function ({ value, keysString }) {
  if (value === undefined || value === null) {
    throw new Error(`Setting "netlifyConfig.${keysString}" to ${value} is not allowed.
Please set this property to a specific value instead.`)
  }
}
