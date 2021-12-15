import { throwUserError } from '../error.js'

import { logWarning } from './logger.js'

export const throwOnInvalidTomlSequence = function (invalidSequence) {
  throwUserError(
    `In netlify.toml, the following backslash should be escaped: ${invalidSequence}
The following should be used instead: \\${invalidSequence}`,
  )
}

export const warnLegacyFunctionsDirectory = ({ config = {}, logs }) => {
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

export const warnContextPluginConfig = function (logs, packageName, context) {
  logWarning(
    logs,
    `
"${packageName}" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.
To run "${packageName}" in the ${context} context only, uninstall the plugin from the site plugins list.`,
  )
}

export const throwContextPluginsConfig = function (packageName, context) {
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

export const warnHeadersParsing = function (logs, errors) {
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
export const warnHeadersCaseSensitivity = function (logs, headers) {
  const headersA = headers.flatMap(getHeaderNames).filter(isNotDuplicateHeaderName).map(addHeaderLowerCase)
  const differentCaseHeader = headersA.find(hasHeaderCaseDuplicate)
  if (differentCaseHeader === undefined) {
    return
  }

  const { forPath, headerName } = headersA.find((header) => isHeaderCaseDuplicate(header, differentCaseHeader))
  const sameForPath = forPath === differentCaseHeader.forPath ? ` for "${forPath}"` : ''
  logWarning(
    logs,
    `
Warning: the same header is set twice with different cases${sameForPath}: "${headerName}" and "${differentCaseHeader.headerName}"`,
  )
}

const getHeaderNames = function ({ for: forPath, values = {} }) {
  return Object.keys(values).map((headerName) => ({ forPath, headerName }))
}

const isNotDuplicateHeaderName = function ({ headerName }, index, headers) {
  return headers.slice(index + 1).every((header) => header.headerName !== headerName)
}

const addHeaderLowerCase = function ({ forPath, headerName }) {
  const lowerHeaderName = headerName.toLowerCase()
  return { forPath, headerName, lowerHeaderName }
}

const hasHeaderCaseDuplicate = function ({ lowerHeaderName }, index, headers) {
  return headers.slice(index + 1).some((header) => header.lowerHeaderName === lowerHeaderName)
}

const isHeaderCaseDuplicate = function ({ headerName, lowerHeaderName }, differentCaseHeader) {
  return differentCaseHeader.headerName !== headerName && differentCaseHeader.lowerHeaderName === lowerHeaderName
}

export const warnRedirectsParsing = function (logs, errors) {
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
