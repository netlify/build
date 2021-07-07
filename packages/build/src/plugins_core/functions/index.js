'use strict'

const { join, resolve, relative } = require('path')

const mapObject = require('map-obj')
const pathExists = require('path-exists')
const { isDirectory } = require('path-type')

const { addErrorInfo } = require('../../error/info')
const { log } = require('../../log/logger')
const {
  logBundleResults,
  logFunctionsNonExistingDir,
  logFunctionsToBundle,
} = require('../../log/messages/core_commands')

const { getZipError } = require('./error')

const INTERNAL_FUNCTIONS_PATH = '.netlify/functions-internal'

// Returns `true` if at least one of the functions has been configured to use
// esbuild.
const isUsingEsbuild = (functionsConfig = {}) =>
  Object.values(functionsConfig).some((configObject) => configObject.node_bundler === 'esbuild')

// The function configuration keys returned by @netlify/config are not an exact
// match to the properties that @netlify/zip-it-and-ship-it expects. We do that
// translation here.
const normalizeFunctionConfig = ({ buildDir, featureFlags, functionConfig = {} }) => ({
  externalNodeModules: functionConfig.external_node_modules,
  includedFiles: functionConfig.included_files,
  includedFilesBasePath: buildDir,
  ignoredNodeModules: functionConfig.ignored_node_modules,

  // When the user selects esbuild as the Node bundler, we still want to use
  // the legacy ZISI bundler as a fallback. Rather than asking the user to
  // make this decision, we abstract that complexity away by injecting the
  // fallback behavior ourselves. We do this by transforming the value
  // `esbuild` into `esbuild_zisi`, which zip-it-and-ship-it understands.
  nodeBundler: functionConfig.node_bundler === 'esbuild' ? 'esbuild_zisi' : functionConfig.node_bundler,

  // With the `zisiEsbuildDynamicImports` feature flag, zip-it-and-ship-it will
  // resolve dynamic import expressions by injecting shim files to make the
  // expressions resolve to the right paths at runtime.
  processDynamicNodeImports: Boolean(featureFlags.zisiEsbuildDynamicImports),
})

const getZisiParameters = ({ buildDir, featureFlags, functionsConfig }) => {
  const config = mapObject(functionsConfig, (expression, object) => [
    expression,
    normalizeFunctionConfig({ buildDir, featureFlags, functionConfig: object }),
  ])

  return { basePath: buildDir, config }
}

const zipFunctionsAndLogResults = async ({
  buildDir,
  featureFlags,
  functionsConfig,
  functionsDist,
  functionsSrc,
  internalFunctionsSrc,
  logs,
}) => {
  const zisiParameters = getZisiParameters({ buildDir, featureFlags, functionsConfig })
  const bundler = isUsingEsbuild(functionsConfig) ? 'esbuild' : 'zisi'

  try {
    // Printing an empty line before bundling output.
    log(logs, '')

    // This package currently supports Node 8 but not zip-it-and-ship-it
    // @todo put the `require()` to the top-level scope again once Node 8 support
    // is removed
    // eslint-disable-next-line node/global-require
    const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
    const results = await zipFunctions([internalFunctionsSrc, functionsSrc], functionsDist, zisiParameters)

    logBundleResults({ logs, results })

    return { bundler }
  } catch (error) {
    throw await getZipError(error, functionsSrc)
  }
}

// `getFunctionPaths` will throw if the directory doesn't exist. This is the
// expected behavior when dealing with the functions directory defined in the
// config, but we don't want to throw if the internal functions directory does
// not exist. To that effect, we wrap it with this try/catch and simply return
// an empty array if `getFunctionPaths` fails.
const listInternalFunctions = async (internalFunctionsSrc) => {
  try {
    return await getFunctionPaths(internalFunctionsSrc)
  } catch (_) {
    return []
  }
}

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
const coreCommand = async function ({
  constants: { FUNCTIONS_SRC: relativeFunctionsSrc, FUNCTIONS_DIST: relativeFunctionsDist },
  buildDir,
  logs,
  netlifyConfig,
  featureFlags,
}) {
  const functionsSrc = resolve(buildDir, relativeFunctionsSrc)
  const functionsDist = resolve(buildDir, relativeFunctionsDist)
  const internalFunctionsSrc = join(buildDir, INTERNAL_FUNCTIONS_PATH)

  if (!(await pathExists(functionsSrc))) {
    logFunctionsNonExistingDir(logs, relativeFunctionsSrc)
    return {}
  }

  await validateFunctionsSrc({ functionsSrc, relativeFunctionsSrc })

  const [userFunctions, internalFunctions] = await Promise.all([
    getFunctionPaths(functionsSrc),
    listInternalFunctions(internalFunctionsSrc),
  ])

  logFunctionsToBundle({
    logs,
    userFunctions,
    userFunctionsSrc: relativeFunctionsSrc,
    internalFunctions,
    internalFunctionsSrc: INTERNAL_FUNCTIONS_PATH,
  })

  if (userFunctions.length === 0 && internalFunctions.length === 0) {
    return {}
  }

  const { bundler } = await zipFunctionsAndLogResults({
    buildDir,
    featureFlags,
    functionsConfig: netlifyConfig.functions,
    functionsDist,
    functionsSrc,
    internalFunctionsSrc,
    logs,
  })

  return {
    tags: {
      bundler,
    },
  }
}

const validateFunctionsSrc = async function ({ functionsSrc, relativeFunctionsSrc }) {
  if (await isDirectory(functionsSrc)) {
    return
  }

  const error = new Error(
    `The Netlify Functions setting should target a directory, not a regular file: ${relativeFunctionsSrc}`,
  )
  addErrorInfo(error, { type: 'resolveConfig' })
  throw error
}

const getFunctionPaths = async function (functionsSrc) {
  // This package currently supports Node 8 but not zip-it-and-ship-it
  // @todo put the `require()` to the top-level scope again once Node 8 support
  // is removed
  // eslint-disable-next-line node/global-require
  const { listFunctions } = require('@netlify/zip-it-and-ship-it')
  const functions = await listFunctions(functionsSrc)
  return functions.map(({ mainFile }) => relative(functionsSrc, mainFile))
}

// We use a dynamic `condition` because the functions directory might be created
// by the build command or plugins
const hasFunctionsDir = function ({ constants: { FUNCTIONS_SRC } }) {
  return FUNCTIONS_SRC !== undefined && FUNCTIONS_SRC !== ''
}

const bundleFunctions = {
  event: 'onBuild',
  coreCommand,
  coreCommandId: 'functions_bundling',
  coreCommandName: 'Functions bundling',
  coreCommandDescription: () => 'Functions bundling',
  condition: hasFunctionsDir,
}

module.exports = { bundleFunctions }
