'use strict'

const { resolve, relative } = require('path')

const { zipFunctions, listFunctions } = require('@netlify/zip-it-and-ship-it')
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

const zipFunctionsAndLogResults = async ({ featureFlags, functionsDist, functionsSrc, logs }) => {
  const isEsbuildEnabled = featureFlags.buildbot_esbuild

  // If the `buildbot_esbuild` flag is enabled, we tell zip-it-and-ship-it to
  // bundle JS functions with esbuild, with a fallback to the legacy bundler
  // in case of an error
  const zisiParameters = isEsbuildEnabled
    ? {
        jsBundler: 'esbuild_zisi',
      }
    : {}

  try {
    // Printing an empty line before esbuild output.
    if (isEsbuildEnabled) {
      log(logs, '')
    }

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

  await zipFunctionsAndLogResults({ childEnv, featureFlags, functionsDist, functionsSrc, logs })
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
