'use strict'

// @todo: use `util.isDeepStrictEqual()` after dropping support for Node 8
const fastDeepEqual = require('fast-deep-equal')
const pFilter = require('p-filter')
const pathExists = require('path-exists')

const { resolveUpdatedConfig } = require('../core/config')
const { logConfigOnUpdate } = require('../log/messages/config')

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

module.exports = { updateNetlifyConfig, listConfigSideFiles }
