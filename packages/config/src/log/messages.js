'use strict'

const { throwUserError } = require('../error')

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
  throwUserError(
    `
"${packageName}" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.
To run "${packageName}" in the ${context} context only, uninstall the plugin from the site plugins list.
To run "${packageName}" in all contexts, please remove the following section from "netlify.toml".

  [[context.${context}.plugins]]
  package = "${packageName}"
`,
  )
}

const warnHeadersParsing = function (logs, errors) {
  if (errors.length === 0) {
    return
  }

  const errorMessage = errors.map(getErrorMessage).join('\n\n')
  logWarning(
    logs,
    `
Warning: some headers have syntax errors:

${errorMessage}`,
  )
}

// Headers with different cases are not currently the way users probably
// intend them to be, so we print a warning message.
// See issue at https://github.com/netlify/build/issues/2290
const warnHeadersCaseSensitivity = function (logs, headers) {
  const headersNames = getHeadersNames(headers)
  const headersNamesWithCase = headersNames.map(addHeaderLowerCase)
  const differentCaseHeader = headersNamesWithCase.find(hasHeaderCaseDuplicate)
  if (differentCaseHeader === undefined) {
    return
  }

  const { headerName } = headersNamesWithCase.find((headerProps) =>
    isHeaderCaseDuplicate(headerProps, differentCaseHeader),
  )
  logWarning(
    logs,
    `
Warning: the same header is set twice with different cases: "${headerName}" and "${differentCaseHeader.headerName}"`,
  )
}

const getHeadersNames = function (headers) {
  return [...new Set(headers.flatMap(getHeaderNames))]
}

const getHeaderNames = function ({ values = {} }) {
  return Object.keys(values)
}

const addHeaderLowerCase = function (headerName) {
  const lowerHeaderName = headerName.toLowerCase()
  return { headerName, lowerHeaderName }
}

const hasHeaderCaseDuplicate = function ({ lowerHeaderName }, index, headersNamesWithCase) {
  return headersNamesWithCase.slice(index + 1).some((headerProps) => headerProps.lowerHeaderName === lowerHeaderName)
}

const isHeaderCaseDuplicate = function ({ headerName, lowerHeaderName }, differentCaseHeader) {
  return differentCaseHeader.headerName !== headerName && differentCaseHeader.lowerHeaderName === lowerHeaderName
}

const warnRedirectsParsing = function (logs, errors) {
  if (errors.length === 0) {
    return
  }

  const errorMessage = errors.map(getErrorMessage).join('\n\n')
  logWarning(
    logs,
    `
Warning: some redirects have syntax errors:

${errorMessage}`,
  )
}

const getErrorMessage = function ({ message }) {
  return message
}

module.exports = {
  warnLegacyFunctionsDirectory,
  warnContextPluginConfig,
  throwContextPluginsConfig,
  warnHeadersParsing,
  warnHeadersCaseSensitivity,
  warnRedirectsParsing,
}
