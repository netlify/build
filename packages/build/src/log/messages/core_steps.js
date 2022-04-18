import path from 'path'

import { log, logArray, logErrorSubHeader, logWarningSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

const logBundleResultFunctions = ({ functions, headerMessage, logs, error }) => {
  const functionNames = functions.map(({ path: functionPath }) => path.basename(functionPath))

  if (error) {
    logErrorSubHeader(logs, headerMessage)
  } else {
    logWarningSubHeader(logs, headerMessage)
  }

  logArray(logs, functionNames)
}

export const logBundleResults = ({ logs, results = [] }) => {
  const resultsWithErrors = results.filter(({ bundlerErrors }) => bundlerErrors && bundlerErrors.length !== 0)
  const resultsWithWarnings = results.filter(
    ({ bundler, bundlerWarnings }) => bundler === 'esbuild' && bundlerWarnings && bundlerWarnings.length !== 0,
  )
  const modulesWithDynamicImports = [
    ...new Set(results.flatMap((result) => result.nodeModulesWithDynamicImports || [])),
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

export const logFunctionsNonExistingDir = function (logs, relativeFunctionsSrc) {
  log(logs, `The Netlify Functions setting targets a non-existing directory: ${relativeFunctionsSrc}`)
}

// Print the list of Netlify Functions about to be bundled
export const logFunctionsToBundle = function ({
  logs,
  userFunctions,
  userFunctionsSrc,
  userFunctionsSrcExists,
  internalFunctions,
  internalFunctionsSrc,
  type = 'Functions',
}) {
  if (internalFunctions.length !== 0) {
    log(logs, `Packaging ${type} from ${THEME.highlightWords(internalFunctionsSrc)} directory:`)
    logArray(logs, internalFunctions, { indent: false })
  }

  if (!userFunctionsSrcExists) {
    return
  }

  if (userFunctions.length === 0) {
    log(logs, `No ${type} were found in ${THEME.highlightWords(userFunctionsSrc)} directory`)

    return
  }

  if (internalFunctions.length !== 0) {
    log(logs, '')
  }

  log(logs, `Packaging ${type} from ${THEME.highlightWords(userFunctionsSrc)} directory:`)
  logArray(logs, userFunctions, { indent: false })
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
