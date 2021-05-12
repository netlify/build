'use strict'

const path = require('path')

const { log, logArray, logErrorSubHeader, logWarningSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logBundleResultFunctions = ({ functions, headerMessage, logs, error }) => {
  const functionNames = functions.map(({ path: functionPath }) => path.basename(functionPath))

  if (error) {
    logErrorSubHeader(logs, headerMessage)
  } else {
    logWarningSubHeader(logs, headerMessage)
  }

  logArray(logs, functionNames)
}

const logBundleResults = ({ logs, results = [] }) => {
  const resultsWithErrors = results.filter(({ bundlerErrors }) => bundlerErrors && bundlerErrors.length !== 0)
  const resultsWithWarnings = results.filter(
    ({ bundler, bundlerWarnings }) => bundler === 'esbuild' && bundlerWarnings && bundlerWarnings.length !== 0,
  )
  const modulesWithDynamicImports = [
    ...new Set(results.map((result) => result.nodeModulesWithDynamicImports || []).flat()),
  ]

  if (resultsWithErrors.length !== 0) {
    logBundleResultFunctions({
      functions: resultsWithErrors,
      headerMessage: 'Failed to bundle functions with selected bundler (fallback used):',
      logs,
      error: true,
    })
  }

  if (resultsWithWarnings.length !== 0) {
    logBundleResultFunctions({
      functions: resultsWithWarnings,
      headerMessage: 'Functions bundled with warnings:',
      logs,
      error: false,
    })
  }

  if (modulesWithDynamicImports.length !== 0) {
    logModulesWithDynamicImports({ logs, modulesWithDynamicImports })
  }
}

const logFunctionsNonExistingDir = function (logs, relativeFunctionsSrc) {
  log(logs, `The Netlify Functions setting targets a non-existing directory: ${relativeFunctionsSrc}`)
}

// Print the list of Netlify Functions about to be bundled
const logFunctionsToBundle = function (logs, functions, relativeFunctionsSrc) {
  if (functions.length === 0) {
    log(logs, `No Functions were found in ${THEME.highlightWords(relativeFunctionsSrc)} directory`)
    return
  }

  log(logs, `Packaging Functions from ${THEME.highlightWords(relativeFunctionsSrc)} directory:`)
  logArray(logs, functions, { indent: false })
}

const logModulesWithDynamicImports = ({ logs, modulesWithDynamicImports }) => {
  const externalNodeModules = modulesWithDynamicImports.map((moduleName) => `"${moduleName}"`).join(', ')

  logWarningSubHeader(logs, `The following Node.js modules use dynamic expressions to include files:`)
  logArray(logs, modulesWithDynamicImports)
  log(
    logs,
    `\n  Because files included with dynamic expressions aren't bundled with your serverless functions by default,
  this may result in an error when invoking a function. To resolve this error, you can mark these Node.js
  modules as external in the [functions] section of your \`netlify.toml\` configuration file:
  
  [functions]
    external_node_modules = [${externalNodeModules}]

  Visit https://ntl.fyi/dynamic-imports for more information.
  `,
  )
}

module.exports = {
  logBundleResults,
  logFunctionsToBundle,
  logFunctionsNonExistingDir,
}
