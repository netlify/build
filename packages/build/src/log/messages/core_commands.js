'use strict'

const { log, logArray, logError } = require('../logger')
const { THEME } = require('../theme')

const logExperimentalEsbuildParameter = function (logs, parameterNames) {
  const parametersMessage =
    parameterNames.length === 0 ? '' : ` and the following configuration properties: ${parameterNames.join(', ')}`

  logError(
    logs,
    `
You've opted in to an experimental bundling mechanism via the "NETLIFY_EXPERIMENTAL_ESBUILD" environment variable${parametersMessage}.
We recommend against using this functionality in production sites, since its behavior may change or it may be removed entirely.
For the latest updates about this feature, please visit our Community: community.netlify.com.
`,
  )
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
  logExperimentalEsbuildParameter,
  logFunctionsToBundle,
  logFunctionsNonExistingDir,
}
