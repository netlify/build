import readdirp from 'readdirp'

import { addErrorInfo } from '../../error/info.js'

const MODULE_NOT_FOUND_CODE = 'MODULE_NOT_FOUND'
const MODULE_NOT_FOUND_ESBUILD_REGEXP = /^Could not resolve ['"]([^'"]+)/
const MODULE_NOT_FOUND_REGEXP = /Cannot find module ['"]([^'"]+)/

// Handle errors coming from zip-it-and-ship-it
export const getZipError = async function (error, functionsSrc) {
  const moduleNotFoundError = await getModuleNotFoundError(error, functionsSrc)

  if (moduleNotFoundError) {
    return moduleNotFoundError
  }

  if (isPackageJsonError(error)) {
    return getPackageJsonError(error)
  }

  return error
}

const getModuleNotFoundError = async function (error, functionsSrc) {
  const errorFromZisi = await getModuleNotFoundErrorFromZISI(error, functionsSrc)

  if (errorFromZisi) {
    return errorFromZisi
  }

  const errorFromEsbuild = await getModuleNotFoundErrorFromEsbuild(error, functionsSrc)

  if (errorFromEsbuild) {
    return errorFromEsbuild
  }
}

const getModuleNotFoundErrorObject = async ({ error, functionsSrc, moduleNames }) => {
  const message = await getModuleNotFoundMessage(functionsSrc, moduleNames)

  error.message = `${message}\n\n${error.message}`
  addErrorInfo(error, { type: 'dependencies' })

  return error
}

const getModuleNotFoundMessage = async function (functionsSrc, moduleNames) {
  if (moduleNames.length === 0 || !(await lacksNodeModules(functionsSrc))) {
    return MODULE_NOT_FOUND_MESSAGE
  }

  if (moduleNames.filter(Boolean).some(isLocalPath)) {
    return PATH_NOT_FOUND_MESSAGE
  }

  return getLocalInstallMessage(moduleNames)
}

const isLocalPath = function (moduleName) {
  return moduleName.startsWith('.') || moduleName.startsWith('/')
}

const getModuleNotFoundErrorFromEsbuild = function (error, functionsSrc) {
  const { errors = [] } = error
  const modulesNotFound = errors.reduce((modules, errorObject) => {
    const match = errorObject.text.match(MODULE_NOT_FOUND_ESBUILD_REGEXP)

    if (!match) {
      return modules
    }

    return [...modules, match[1]]
  }, [])

  if (modulesNotFound.length === 0) {
    return
  }

  return getModuleNotFoundErrorObject({ error, functionsSrc, moduleNames: modulesNotFound })
}

const getModuleNotFoundErrorFromZISI = function (error, functionsSrc) {
  if (!(error instanceof Error && error.code === MODULE_NOT_FOUND_CODE)) {
    return
  }

  const moduleName = getModuleNameFromZISIError(error)

  return getModuleNotFoundErrorObject({ error, functionsSrc, moduleNames: moduleName ? [moduleName] : [] })
}

// This error message always include the same words
const getModuleNameFromZISIError = function (error) {
  if (typeof error.message !== 'string') {
    return
  }

  const result = MODULE_NOT_FOUND_REGEXP.exec(error.message)
  if (result === null) {
    return
  }

  return result[1]
}

// Netlify Functions has a `package.json` but no `node_modules`
const lacksNodeModules = async function (functionsSrc) {
  return (
    functionsSrc !== undefined &&
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
Please make sure it is present in the site's top-level "package.json".`
const PATH_NOT_FOUND_MESSAGE = `A Netlify Function failed to require a local file.
Please make sure the file exists and its path is correctly spelled.`

// A common mistake is to assume Netlify Functions dependencies are
// automatically installed. This checks for this pattern.
const getLocalInstallMessage = function (modules) {
  const genericMessage = `

By default, dependencies inside a Netlify Function's "package.json" are not automatically installed.
There are several ways to fix this problem:
  - Removing your Function's "package.json" and adding the dependencies to the project's top-level "package.json" instead. This is the fastest and safest solution.
  - Running "npm install" or "yarn" inside your Netlify Function in your build command.
  - Adding the following plugin to your "netlify.toml":

[[plugins]]
package = "@netlify/plugin-functions-install-core"
  `

  if (modules.length === 1) {
    return `A Netlify Function is using "${modules[0]}" but that dependency has not been installed yet.${genericMessage}`
  }

  const moduleNames = modules.map((name) => `"${name}"`).join(', ')

  return `A Netlify Function is using dependencies that have not been installed yet: ${moduleNames}${genericMessage}`
}

// We need to load the site's `package.json` when bundling Functions. This is
// because `optionalDependencies` can make `import()` fail, but we don't want
// to error then. However, if the `package.json` is invalid, we fail the build.
const isPackageJsonError = function (error) {
  return error.message.includes(PACKAGE_JSON_ORIGINAL_MESSAGE)
}

const PACKAGE_JSON_ORIGINAL_MESSAGE = 'is invalid JSON'

const getPackageJsonError = function (error) {
  addErrorInfo(error, { type: 'resolveConfig' })
  return error
}
