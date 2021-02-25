'use strict'

const path = require('path')

const { log, logArray, logErrorSubHeader, pointer } = require('../logger')
const { THEME } = require('../theme')

const logBundleErrorObject = ({ logs, object }) => {
  const { location = {}, text } = object
  const { column, file, line, lineText } = location
  const locationMessage = `${file} ${line}:${column}`
  const logMessage = `${pointer} ${lineText}
  (in ${locationMessage})

  ${text}
  
  `

  log(logs, logMessage, { indent: true })
}

const logBundleResult = ({ errorMessage, logs, result }) => {
  const { bundlerErrors = [], bundlerWarnings = [] } = result

  if (bundlerErrors.length === 0 && bundlerWarnings.length === 0) {
    return
  }

  if (errorMessage) {
    logErrorSubHeader(logs, errorMessage)
  }

  const bundlerEvents = [...bundlerErrors, ...bundlerWarnings]

  bundlerEvents.forEach((bundlerEvent) => {
    logBundleErrorObject({ logs, object: bundlerEvent })
  })
}

const logBundleResults = ({ logs, results = [], zisiParameters = {} }) => {
  if (!zisiParameters.jsBundler) {
    return
  }

  results.forEach((result) => {
    if (result.runtime !== 'js' || !result.path) {
      return
    }

    const functionName = path.basename(result.path)

    if (result.bundler === 'zisi') {
      logBundleResult({
        errorMessage: `Failed to bundle function \`${functionName}\` (fallback bundler used):`,
        logs,
        result,
      })
    } else if (result.bundler === 'esbuild') {
      logBundleResult({
        errorMessage: `Function \`${functionName}\` bundled with warnings:`,
        logs,
        result,
      })
    }
  })
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
