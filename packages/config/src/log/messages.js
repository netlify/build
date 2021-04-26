'use strict'

const { throwError } = require('../error')

const { logWarning } = require('./logger')

const warnLegacyFunctionsDirectory = ({ config = {}, logs }) => {
  const { functionsDirectory, functionsDirectoryOrigin } = config

  if (functionsDirectoryOrigin !== 'config-v1') {
    return
  }

  logWarning(
    logs,
    `
Detected functions directory configuration in netlify.toml under [build] settings.
We recommend updating netlify.toml to set the functions directory under [functions] settings using the directory property. For example,

[functions]
  directory = "${functionsDirectory}"`,
  )
}

const warnContextPluginConfig = function (logs, packageName, context) {
  logWarning(
    logs,
    `
"${packageName}" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.
To run "${packageName}" in the ${context} context only, uninstall the plugin from the site plugins list.`,
  )
}

const throwContextPluginsConfig = function (packageName, context) {
  throwError(
    `
"${packageName}" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.
To run "${packageName}" in the ${context} context only, uninstall the plugin from the site plugins list.
To run "${packageName}" in all contexts, please remove the following section from "netlify.toml".

  [[context.${context}.plugins]]
  package = "${packageName}"
`,
  )
}

module.exports = { warnLegacyFunctionsDirectory, warnContextPluginConfig, throwContextPluginsConfig }
