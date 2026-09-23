import { readdirpPromise } from 'readdirp'

import { addErrorInfo } from '../../error/info.js'

const MODULE_NOT_FOUND_CODE = 'MODULE_NOT_FOUND'
const MODULE_NOT_FOUND_ESBUILD_REGEXP = /^Could not resolve ['"]([^'"]+)/
const MODULE_NOT_FOUND_REGEXP = /Cannot find module ['"]([^'"]+)/

type ZipError = {
  message: string
  // Set by esbuild build failures
  errors?: { text: string }[]
}

// Handle errors coming from zip-it-and-ship-it
export const getZipError = async function (error: unknown, functionsSrc: string | undefined): Promise<unknown> {
  // Everything thrown while bundling functions is an `Error`, which is what the checks below rely on
  const zipError = error as ZipError
  const moduleNotFoundError = await getModuleNotFoundError(zipError, functionsSrc)

  if (moduleNotFoundError) {
    return moduleNotFoundError
  }

  if (isPackageJsonError(zipError)) {
    return getPackageJsonError(zipError)
  }

  if (isGoVersionError(zipError)) {
    return getGoVersionError(zipError)
  }

  if (isGoMissingDependencyError(zipError)) {
    return getGoMissingDependencyError(zipError)
  }

  return zipError
}

const getModuleNotFoundError = async function (
  error: ZipError,
  functionsSrc: string | undefined,
): Promise<ZipError | undefined> {
  const errorFromZisi = await getModuleNotFoundErrorFromZISI(error, functionsSrc)

  if (errorFromZisi) {
    return errorFromZisi
  }

  return await getModuleNotFoundErrorFromEsbuild(error, functionsSrc)
}

const getModuleNotFoundErrorObject = async ({
  error,
  functionsSrc,
  moduleNames,
}: {
  error: ZipError
  functionsSrc: string | undefined
  moduleNames: string[]
}): Promise<ZipError> => {
  const message = await getModuleNotFoundMessage(functionsSrc, moduleNames)

  error.message = `${message}\n\n${error.message}`
  addErrorInfo(error, { type: 'dependencies' })

  return error
}

const getModuleNotFoundMessage = async function (
  functionsSrc: string | undefined,
  moduleNames: string[],
): Promise<string> {
  if (moduleNames.length === 0 || !(await lacksNodeModules(functionsSrc))) {
    return MODULE_NOT_FOUND_MESSAGE
  }

  if (moduleNames.filter(Boolean).some(isLocalPath)) {
    return PATH_NOT_FOUND_MESSAGE
  }

  return getLocalInstallMessage(moduleNames)
}

const isLocalPath = function (moduleName: string): boolean {
  return moduleName.startsWith('.') || moduleName.startsWith('/')
}

const getModuleNotFoundErrorFromEsbuild = function (
  error: ZipError,
  functionsSrc: string | undefined,
): Promise<ZipError> | undefined {
  const { errors = [] } = error
  const modulesNotFound = errors.reduce<string[]>((modules, errorObject) => {
    const match = MODULE_NOT_FOUND_ESBUILD_REGEXP.exec(errorObject.text)
    // The capture group is mandatory, so it is set whenever there is a match
    const moduleName = match?.[1]

    if (moduleName === undefined) {
      return modules
    }

    return [...modules, moduleName]
  }, [])

  if (modulesNotFound.length === 0) {
    return
  }

  return getModuleNotFoundErrorObject({ error, functionsSrc, moduleNames: modulesNotFound })
}

const getModuleNotFoundErrorFromZISI = function (
  error: unknown,
  functionsSrc: string | undefined,
): Promise<ZipError> | undefined {
  if (!(error instanceof Error && 'code' in error && error.code === MODULE_NOT_FOUND_CODE)) {
    return
  }

  const moduleName = getModuleNameFromZISIError(error)

  return getModuleNotFoundErrorObject({ error, functionsSrc, moduleNames: moduleName ? [moduleName] : [] })
}

// This error message always include the same words
const getModuleNameFromZISIError = function (error: { message: unknown }): string | undefined {
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
const lacksNodeModules = async function (functionsSrc: string | undefined): Promise<boolean> {
  return (
    functionsSrc !== undefined &&
    (await hasFunctionRootFile('package.json', functionsSrc)) &&
    !(await hasFunctionRootFile('node_modules', functionsSrc))
  )
}

// Functions can be either files or directories, so we need to check on two
// depth levels
const hasFunctionRootFile = async function (filename: string, functionsSrc: string): Promise<boolean> {
  const files = await readdirpPromise(functionsSrc, { depth: 1, fileFilter: filename })
  return files.length !== 0
}

const MODULE_NOT_FOUND_MESSAGE = `A Netlify Function failed to require one of its dependencies.
Please make sure it is present in the site's top-level "package.json".`
const PATH_NOT_FOUND_MESSAGE = `A Netlify Function failed to require a local file.
Please make sure the file exists and its path is correctly spelled.`

// A common mistake is to assume Netlify Functions dependencies are
// automatically installed. This checks for this pattern.
const getLocalInstallMessage = function (modules: string[]): string {
  const genericMessage = `

By default, dependencies inside a Netlify Function's "package.json" are not automatically installed.
There are several ways to fix this problem:
  - Removing your Function's "package.json" and adding the dependencies to the project's top-level "package.json" instead. This is the fastest and safest solution.
  - Running "npm install" or "yarn" inside your Netlify Function in your build command.
  - Adding the following plugin to your "netlify.toml":

[[plugins]]
package = "@netlify/plugin-functions-install-core"
  `

  const [moduleName, ...otherModules] = modules
  if (moduleName !== undefined && otherModules.length === 0) {
    return `A Netlify Function is using "${moduleName}" but that dependency has not been installed yet.${genericMessage}`
  }

  const moduleNames = modules.map((name) => `"${name}"`).join(', ')

  return `A Netlify Function is using dependencies that have not been installed yet: ${moduleNames}${genericMessage}`
}

// We need to load the site's `package.json` when bundling Functions. This is
// because `optionalDependencies` can make `import()` fail, but we don't want
// to error then. However, if the `package.json` is invalid, we fail the build.
const isPackageJsonError = function (error: ZipError): boolean {
  return PACKAGE_JSON_ORIGINAL_MESSAGES.some((msg) => error.message.includes(msg))
}

const PACKAGE_JSON_ORIGINAL_MESSAGES = ['is invalid JSON', 'in JSON at position']

const getPackageJsonError = function (error: ZipError): ZipError {
  addErrorInfo(error, { type: 'resolveConfig' })
  return error
}

const isGoVersionError = function (error: ZipError): boolean {
  return error.message.includes('module requires Go')
}

const getGoVersionError = function (error: ZipError): ZipError {
  addErrorInfo(error, { type: 'resolveConfig' })
  return error
}

const isGoMissingDependencyError = function (error: ZipError): boolean {
  return (
    error.message.includes('missing go.sum entry for module providing package') ||
    error.message.includes('no required module provides package')
  )
}

const getGoMissingDependencyError = function (error: ZipError): ZipError {
  addErrorInfo(error, { type: 'dependencies' })
  return error
}
