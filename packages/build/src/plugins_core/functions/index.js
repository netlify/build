'use strict'

const { resolve, relative } = require('path')

const { zipFunctions, listFunctions } = require('@netlify/zip-it-and-ship-it')
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

const normalizeFunctionConfig = (functionConfig) => {
  // The function configuration keys returned by @netlify/config are not an
  // exact match to the properties that @netlify/zip-it-and-ship-it expects.
  // We do that translation according to this map.
  const zisiConfigMap = {
    external_node_modules: 'externalNodeModules',
    ignored_node_modules: 'ignoredNodeModules',
    node_bundler: 'nodeBundler',
  }
  const normalizedConfig = mapObject(functionConfig, (key, value) => {
    const normalizedKey = zisiConfigMap[key] || key

    // When the user selects esbuild as the Node bundler, we still want to use
    // the legacy ZISI bundler as a fallback. Rather than asking the user to
    // make this decision, we abstract that complexity away by injecting the
    // fallback behavior ourselves. We do this by transforming the value
    // `esbuild` into `esbuild_zisi`, which zip-it-and-ship-it understands.
    if (normalizedKey === 'nodeBundler' && value === 'esbuild') {
      return [normalizedKey, 'esbuild_zisi']
    }

    return [normalizedKey, value]
  })

  return normalizedConfig
}

const getZisiParameters = ({ functionsConfig }) => {
  const parameters = {
    config: mapObject(functionsConfig, (expression, object) => [expression, normalizeFunctionConfig(object)]),
  }

  return parameters
}

const zipFunctionsAndLogResults = async ({ functionsConfig, functionsDist, functionsSrc, logs }) => {
  const zisiParameters = getZisiParameters({ functionsConfig })

  try {
    // Printing an empty line before bundling output.
    log(logs, '')

    const results = await zipFunctions(functionsSrc, functionsDist, zisiParameters)

    logBundleResults({ logs, results, zisiParameters })
  } catch (error) {
    throw await getZipError(error, functionsSrc)
  }
}

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
const coreCommand = async function ({
  constants: { FUNCTIONS_SRC: relativeFunctionsSrc, FUNCTIONS_DIST: relativeFunctionsDist },
  buildDir,
  logs,
  childEnv,
  featureFlags,
  netlifyConfig,
}) {
  const functionsSrc = resolve(buildDir, relativeFunctionsSrc)
  const functionsDist = resolve(buildDir, relativeFunctionsDist)

  if (!(await pathExists(functionsSrc))) {
    logFunctionsNonExistingDir(logs, relativeFunctionsSrc)
    return
  }

  await validateFunctionsSrc({ functionsSrc, relativeFunctionsSrc })

  const functions = await getFunctionPaths(functionsSrc)
  logFunctionsToBundle(logs, functions, relativeFunctionsSrc)

  if (functions.length === 0) {
    return
  }

  await zipFunctionsAndLogResults({
    childEnv,
    featureFlags,
    functionsConfig: netlifyConfig.functions,
    functionsDist,
    functionsSrc,
    logs,
  })
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
  const functions = await listFunctions(functionsSrc)
  return functions.map(({ mainFile }) => relative(functionsSrc, mainFile))
}

// We use a dynamic `condition` because the functions directory might be created
// by the build command or plugins
const hasFunctionsDir = function ({ constants: { FUNCTIONS_SRC } }) {
  return FUNCTIONS_SRC !== undefined
}

const bundleFunctions = {
  event: 'onBuild',
  coreCommand,
  coreCommandId: 'functions_bundling',
  coreCommandName: 'Functions bundling',
  condition: hasFunctionsDir,
}

module.exports = { bundleFunctions }
