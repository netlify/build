'use strict'

const path = require('path')

const { log, logArray, logErrorSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logBundleErrorObject = ({ logs, object }) => {
  const { location = {}, text } = object
  const { column, file, line, lineText } = location
  const locationMessage = `${file} ${line}:${column}`
  const logMessage = `> ${lineText}
  (in ${locationMessage})

  ${text}
  
  `

  log(logs, logMessage, { indent: true })
}

const logEsbuildBundleResult = ({ functionName, logs, result }) => {
  const { bundlerErrors = [], bundlerWarnings = [] } = result

  if (bundlerErrors.length !== 0) {
    logErrorSubHeader(logs, `Bundling function \`${functionName}\` has failed:`)

    bundlerErrors.forEach((error) => {
      logBundleErrorObject({ logs, object: error })
    })
  }

  if (bundlerWarnings.length !== 0) {
    logErrorSubHeader(logs, `Bundling function \`${functionName}\` has produced some warnings:`)

    bundlerWarnings.forEach((error) => {
      logBundleErrorObject({ logs, object: error })
    })
  }
}

const logZISIBundleResult = ({ functionName, logs, result }) => {
  const { bundlerErrors = [] } = result

  if (bundlerErrors.length === 0) {
    return
  }

  logErrorSubHeader(logs, `Fallback bundler used for function \`${functionName}\`:`)

  bundlerErrors.forEach((error) => {
    logBundleErrorObject({ logs, object: error })
  })
}

const logBundleResults = ({ logs, results = [] }) => {
  results.forEach((result) => {
    if (result.runtime !== 'js' || !result.path) {
      return
    }

    const functionName = path.basename(result.path)

    if (result.bundler === 'zisi') {
      logZISIBundleResult({ functionName, logs, result })
    } else if (result.bundler === 'esbuild') {
      logEsbuildBundleResult({ functionName, logs, result })
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
