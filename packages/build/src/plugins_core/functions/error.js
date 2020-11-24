'use strict'

const readdirp = require('readdirp')

const { addErrorInfo } = require('../../error/info')

// Handle errors coming from zip-it-and-ship-it
const getZipError = function (error, functionsSrc) {
  if (isModuleNotFoundError(error)) {
    return getModuleNotFoundError(error, functionsSrc)
  }

  if (isPackageJsonError(error)) {
    return getPackageJsonError(error)
  }

  return error
}

const isModuleNotFoundError = function (error) {
  return error instanceof Error && error.code === MODULE_NOT_FOUND_CODE
}

const MODULE_NOT_FOUND_CODE = 'MODULE_NOT_FOUND'

const getModuleNotFoundError = async function (error, functionsSrc) {
  const message = await getModuleNotFoundMessage(error, functionsSrc)
  error.message = `${message}\n\n${error.message}`
  addErrorInfo(error, { type: 'dependencies' })
  return error
}

const getModuleNotFoundMessage = async function (error, functionsSrc) {
  const moduleName = getModuleName(error)
  if (moduleName !== undefined && (await lacksNodeModules(functionsSrc))) {
    return getLocalInstallMessage(moduleName)
  }

  return MODULE_NOT_FOUND_MESSAGE
}

// This error message always include the same words
const getModuleName = function (error) {
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

// Netlify Functions has a `package.json` but no `node_modules`
const lacksNodeModules = async function (functionsSrc) {
  return (
    (await hasFunctionRootFile('package.json', functionsSrc)) &&
    !(await hasFunctionRootFile('node_modules', functionsSrc))
  )
}

// Functions can be either files or directories, so we need to check on two
// depth levels
const hasFunctionRootFile = async function (filename, functionsSrc) {
  const files = await readdirp.promise(functionsSrc, { depth: 1, fileFilter: filename })
  return files.length !== 0
}

const MODULE_NOT_FOUND_MESSAGE = `A Netlify Function failed to require one of its dependencies.
If the dependency is a Node module, please make sure it is present in the site's top-level "package.json".
If it is a local file instead, please make sure the file exists and its filename is correctly spelled.`

// A common mistake is to assume Netlify Functions dependencies are
// automatically installed. This checks for this pattern.
const getLocalInstallMessage = function (moduleName) {
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

// We need to load the site's `package.json` when bundling Functions. This is
// because `optionalDependencies` can make `require()` fail, but we don't want
// to error then. However, if the `package.json` is invalid, we fail the build.
const isPackageJsonError = function (error) {
  return error.message.includes(PACKAGE_JSON_ORIGINAL_MESSAGE)
}

const PACKAGE_JSON_ORIGINAL_MESSAGE = 'is invalid JSON'

const getPackageJsonError = function (error) {
  addErrorInfo(error, { type: 'resolveConfig' })
  return error
}

module.exports = { getZipError }
