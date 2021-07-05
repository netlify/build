'use strict'

const { resolve } = require('path')

const pFilter = require('p-filter')
const pathExists = require('path-exists')

const { resolveUpdatedConfig } = require('../core/config')
const { logConfigOnUpdate } = require('../log/messages/config')
const { applyMutations } = require('../plugins/mutations')

// If `netlifyConfig` was updated or `_redirects` was created, the configuration
// is updated by calling `@netlify/config` again.
const updateNetlifyConfig = async function ({
  configOpts,
  priorityConfig,
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
    return { netlifyConfig, priorityConfig }
  }

  const priorityConfigA = applyMutations(priorityConfig, configMutations)
  const netlifyConfigA = await resolveUpdatedConfig({ configOpts, priorityConfig: priorityConfigA, context, branch })
  logConfigOnUpdate({ logs, netlifyConfig: netlifyConfigA, debug })
  // eslint-disable-next-line fp/no-mutation,no-param-reassign
  errorParams.netlifyConfig = netlifyConfigA
  return { netlifyConfig: netlifyConfigA, priorityConfig: priorityConfigA }
}

const shouldUpdateConfig = async function ({ configMutations, configSideFiles, netlifyConfig, buildDir }) {
  return (
    configMutations.length !== 0 || (await haveConfigSideFilesChanged({ configSideFiles, netlifyConfig, buildDir }))
  )
}

// The configuration mostly depends on `netlify.toml` and UI build settings.
// However, it also uses some additional optional side files:
// `_redirects` in the publish directory.
// Those are often created by the build command. When those are created, we need
// to update the configuration. We detect this by checking for file existence
// before and after running plugins and the build command.
const haveConfigSideFilesChanged = async function ({ configSideFiles, netlifyConfig, buildDir }) {
  const newSideFiles = await listConfigSideFiles(netlifyConfig, buildDir)
  // @todo: use `util.isDeepStrictEqual()` after dropping support for Node 8
  return newSideFiles.join(',') !== configSideFiles.join(',')
}

const listConfigSideFiles = async function ({ build: { publish } }, buildDir) {
  const publishSideFiles = PUBLISH_SIDE_FILES.map((publishSideFile) => resolve(buildDir, publish, publishSideFile))
  const configSideFiles = await pFilter(publishSideFiles, pathExists)
  // eslint-disable-next-line fp/no-mutating-methods
  return configSideFiles.sort()
}

const PUBLISH_SIDE_FILES = ['_redirects']

module.exports = { updateNetlifyConfig, listConfigSideFiles }
