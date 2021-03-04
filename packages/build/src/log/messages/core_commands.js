'use strict'

const path = require('path')

const { log, logArray, logErrorSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logBundleResultFunctions = ({ functions, headerMessage, logs }) => {
  const functionNames = functions.map(({ path: functionPath }) => path.basename(functionPath))

  logErrorSubHeader(logs, headerMessage)
  logArray(logs, functionNames)
}

const logBundleResults = ({ logs, results = [], zisiParameters = {} }) => {
  if (!zisiParameters.jsBundler) {
    return
  }

  const resultsWithErrors = results.filter(({ bundlerErrors }) => bundlerErrors && bundlerErrors.length !== 0)
  const resultsWithWarnings = results.filter(
    ({ bundler, bundlerWarnings }) => bundler === 'esbuild' && bundlerWarnings && bundlerWarnings.length !== 0,
  )

  log(logs, '')

  if (resultsWithErrors.length !== 0) {
    logBundleResultFunctions({
      functions: resultsWithErrors,
      headerMessage: 'Failed to bundle functions with default bundler (fallback used):',
      logs,
    })
  }

  if (resultsWithWarnings.length !== 0) {
    logBundleResultFunctions({
      functions: resultsWithWarnings,
      headerMessage: 'Functions bundled with warnings:',
      logs,
    })
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

module.exports = {
  logBundleResults,
  logFunctionsToBundle,
  logFunctionsNonExistingDir,
}
