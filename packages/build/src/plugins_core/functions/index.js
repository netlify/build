'use strict'

const { resolve } = require('path')

const mapObject = require('map-obj')
const pathExists = require('path-exists')

const { log } = require('../../log/logger')
const {
  logBundleResults,
  logFunctionsNonExistingDir,
  logFunctionsToBundle,
} = require('../../log/messages/core_commands')

const { getZipError } = require('./error')
const { getUserAndInternalFunctions, validateFunctionsSrc } = require('./utils')

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
    const sourceDirectories = [internalFunctionsSrc, functionsSrc].filter(Boolean)
    const results = await zipFunctions(sourceDirectories, functionsDist, zisiParameters)

    logBundleResults({ logs, results })

    return { bundler }
  } catch (error) {
    throw await getZipError(error, functionsSrc)
  }
}

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
// eslint-disable-next-line complexity
const coreCommand = async function ({
  constants: {
    INTERNAL_FUNCTIONS_SRC: relativeInternalFunctionsSrc,
    FUNCTIONS_SRC: relativeFunctionsSrc,
    FUNCTIONS_DIST: relativeFunctionsDist,
  },
  buildDir,
  logs,
  netlifyConfig,
  featureFlags,
}) {
  const functionsSrc = relativeFunctionsSrc === undefined ? undefined : resolve(buildDir, relativeFunctionsSrc)
  const functionsDist = resolve(buildDir, relativeFunctionsDist)
  const internalFunctionsSrc = resolve(buildDir, relativeInternalFunctionsSrc)
  const internalFunctionsSrcExists = await pathExists(internalFunctionsSrc)
  const functionsSrcExists = await validateFunctionsSrc({ functionsSrc, logs, relativeFunctionsSrc })
  const [userFunctions = [], internalFunctions = []] = await getUserAndInternalFunctions({
    functionsSrc,
    functionsSrcExists,
    internalFunctionsSrc,
    internalFunctionsSrcExists,
  })

  if (functionsSrc && !functionsSrcExists) {
    logFunctionsNonExistingDir(logs, relativeFunctionsSrc)

    if (internalFunctions.length !== 0) {
      log(logs, '')
    }
  }

  logFunctionsToBundle({
    logs,
    userFunctions,
    userFunctionsSrc: relativeFunctionsSrc,
    userFunctionsSrcExists: functionsSrcExists,
    internalFunctions,
    internalFunctionsSrc: relativeInternalFunctionsSrc,
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

// We run this core command if at least one of the functions directories (the
// one configured by the user or the internal one) exists. We use a dynamic
// `condition` because the directories might be created by the build command
// or plugins.
const hasFunctionsDirectories = async function ({ buildDir, constants: { INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC } }) {
  const hasFunctionsSrc = FUNCTIONS_SRC !== undefined && FUNCTIONS_SRC !== ''

  if (hasFunctionsSrc) {
    return true
  }

  const internalFunctionsSrc = resolve(buildDir, INTERNAL_FUNCTIONS_SRC)

  return await pathExists(internalFunctionsSrc)
}

const bundleFunctions = {
  event: 'onBuild',
  coreCommand,
  coreCommandId: 'functions_bundling',
  coreCommandName: 'Functions bundling',
  coreCommandDescription: () => 'Functions bundling',
  condition: hasFunctionsDirectories,
}

module.exports = { bundleFunctions }
