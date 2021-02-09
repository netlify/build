'use strict'

const { resolve, relative } = require('path')

const { zipFunctions, listFunctions } = require('@netlify/zip-it-and-ship-it')
const pathExists = require('path-exists')
const { isDirectory } = require('path-type')

const { addErrorInfo } = require('../../error/info')
const {
  logExperimentalEsbuildParameter,
  logFunctionsNonExistingDir,
  logFunctionsToBundle,
} = require('../../log/messages/core_commands')

const { getZipError } = require('./error')

const getZISIParameters = ({ childEnv, logs }) => {
  // @todo Adjust when experimental support for esbuild is replaced by an
  // official implementation.
  const useEsbuild = Boolean(childEnv.NETLIFY_EXPERIMENTAL_ESBUILD)
  const externalModules = childEnv.NETLIFY_EXPERIMENTAL_EXTERNAL_MODULES
    ? childEnv.NETLIFY_EXPERIMENTAL_EXTERNAL_MODULES.split(',')
    : []

  if (useEsbuild) {
    logExperimentalEsbuildParameter(logs, 'NETLIFY_EXPERIMENTAL_ESBUILD')
  }

  return { externalModules, useEsbuild }
}

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
const coreCommand = async function ({
  constants: { FUNCTIONS_SRC: relativeFunctionsSrc, FUNCTIONS_DIST: relativeFunctionsDist },
  buildDir,
  logs,
  childEnv,
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

  const zisiParameters = getZISIParameters({ childEnv, logs })

  try {
    await zipFunctions(functionsSrc, functionsDist, zisiParameters)
  } catch (error) {
    throw await getZipError(error, functionsSrc)
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
