'use strict'

const { applyMutations, listConfigSideFiles } = require('@netlify/config')

const { resolveUpdatedConfig } = require('../core/config')
const { addErrorInfo } = require('../error/info')
const { logConfigOnUpdate } = require('../log/messages/config')

// If `netlifyConfig` was updated or `_redirects` was created, the configuration
// is updated by calling `@netlify/config` again.
const updateNetlifyConfig = async function ({
  configOpts,
  inlineConfig,
  netlifyConfig,
  context,
  branch,
  buildDir,
  configMutations,
  configSideFiles,
  errorParams,
  logs,
  debug,
}) {
  if (!(await shouldUpdateConfig({ configMutations, configSideFiles, netlifyConfig, buildDir }))) {
    return { netlifyConfig, inlineConfig }
  }

  const inlineConfigA = applyConfigMutations(inlineConfig, configMutations)
  const netlifyConfigA = await resolveUpdatedConfig({ configOpts, inlineConfig: inlineConfigA, context, branch })
  logConfigOnUpdate({ logs, netlifyConfig: netlifyConfigA, debug })
  // eslint-disable-next-line fp/no-mutation,no-param-reassign
  errorParams.netlifyConfig = netlifyConfigA
  return { netlifyConfig: netlifyConfigA, inlineConfig: inlineConfigA }
}

const shouldUpdateConfig = async function ({ configMutations, configSideFiles, netlifyConfig, buildDir }) {
  return (
    configMutations.length !== 0 || (await haveConfigSideFilesChanged({ configSideFiles, netlifyConfig, buildDir }))
  )
}

// The configuration mostly depends on `netlify.toml` and UI build settings.
// However, it also uses some additional optional side files like `_redirects`.
// Those are often created by the build command. When those are created, we need
// to update the configuration. We detect this by checking for file existence
// before and after running plugins and the build command.
const haveConfigSideFilesChanged = async function ({ configSideFiles, netlifyConfig, buildDir }) {
  const newSideFiles = await listConfigSideFiles(netlifyConfig, buildDir)
  // @todo: use `util.isDeepStrictEqual()` after dropping support for Node 8
  return newSideFiles.join(',') !== configSideFiles.join(',')
}

const applyConfigMutations = function (inlineConfig, configMutations) {
  try {
    return applyMutations(inlineConfig, configMutations)
  } catch (error) {
    addErrorInfo(error, { type: 'pluginValidation' })
    throw error
  }
}

module.exports = { updateNetlifyConfig }
