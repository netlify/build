'use strict'

const path = require('path')

const { log, logArray, logErrorSubHeader } = require('../logger')
const { THEME } = require('../theme')

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
      logErrorSubHeader(logs, `Failed to bundle function \`${functionName}\` (fallback bundler used).`)
    } else if (result.bundler === 'esbuild') {
      logErrorSubHeader(logs, `Function \`${functionName}\` bundled with warnings.`)
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
