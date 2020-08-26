const readdirp = require('readdirp')

// Handle errors coming from zip-it-and-ship-it
const getZipError = async function(error, FUNCTIONS_SRC) {
  if (await isModuleNotFound(error, FUNCTIONS_SRC)) {
    return getModuleNotFoundError(error)
  }

  return error
}

// A common mistake is to assume Netlify Functions dependencies are
// automatically installed. This checks for this pattern.
const isModuleNotFound = async function(error, FUNCTIONS_SRC) {
  return (
    error instanceof Error &&
    error.code === MODULE_NOT_FOUND_CODE &&
    getModuleName(error) !== undefined &&
    (await lacksNodeModules(FUNCTIONS_SRC))
  )
}

const MODULE_NOT_FOUND_CODE = 'MODULE_NOT_FOUND'

// Netlify Functions has a `package.json` but no `node_modules`
const lacksNodeModules = async function(FUNCTIONS_SRC) {
  return (
    (await hasFunctionRootFile('package.json', FUNCTIONS_SRC)) &&
    !(await hasFunctionRootFile('node_modules', FUNCTIONS_SRC))
  )
}

// Functions can be either files or directories, so we need to check on two
// depth levels
const hasFunctionRootFile = async function(filename, FUNCTIONS_SRC) {
  const files = await readdirp.promise(FUNCTIONS_SRC, { depth: 1, fileFilter: filename })
  return files.length !== 0
}

const getModuleNotFoundError = function(error) {
  const moduleName = getModuleName(error)
  error.message = `${getWarning(moduleName)}\n${error.message}`
  return error
}

// This error message always include the same words
const getModuleName = function(error) {
  if (typeof error.message !== 'string') {
    return
  }

  const result = MODULE_NOT_FOUND_REGEXP.exec(error.message)
  if (result === null) {
    return
  }

  return result[1]
}

const MODULE_NOT_FOUND_REGEXP = /Cannot find module '(@[^'/]+\/[^'/]+|[^.'/][^'/]*)/

const getWarning = function(moduleName) {
  return `A Netlify Function is using "${moduleName}" but that dependency has not been installed yet.

By default, dependencies inside a Netlify Function's "package.json" are not automatically installed.
There are several ways to fix this problem:
  - Removing your Function's "package.json" and adding the dependencies to the project's top-level "package.json" instead. This is the fastest and safest solution.
  - Running "npm install" or "yarn" inside your Netlify Function in your build command.
  - Adding the following plugin to your "netlify.toml":

[[plugins]]
package = "@netlify/plugin-functions-install-core"
`
}

module.exports = { getZipError }
