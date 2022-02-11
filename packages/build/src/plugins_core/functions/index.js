import { resolve } from 'path'

import { zipFunctions } from '@netlify/zip-it-and-ship-it'
import { pathExists } from 'path-exists'

import { log } from '../../log/logger.js'
import { logBundleResults, logFunctionsNonExistingDir, logFunctionsToBundle } from '../../log/messages/core_steps.js'

import { getZipError } from './error.js'
import { getUserAndInternalFunctions, validateFunctionsSrc } from './utils.js'
import { getZisiParameters } from './zisi.js'

// Returns `true` if at least one of the functions has been configured to use
// esbuild.
const isUsingEsbuild = (functionsConfig = {}) =>
  Object.values(functionsConfig).some((configObject) => configObject.node_bundler === 'esbuild')

const zipFunctionsAndLogResults = async ({
  buildDir,
  childEnv,
  featureFlags,
  functionsConfig,
  functionsDist,
  functionsSrc,
  internalFunctionsSrc,
  isRunningLocally,
  logs,
  repositoryRoot,
}) => {
  const zisiParameters = getZisiParameters({
    buildDir,
    childEnv,
    featureFlags,
    functionsConfig,
    functionsDist,
    isRunningLocally,
    repositoryRoot,
  })
  const bundler = isUsingEsbuild(functionsConfig) ? 'esbuild' : 'zisi'

  try {
    // Printing an empty line before bundling output.
    log(logs, '')

    const sourceDirectories = [internalFunctionsSrc, functionsSrc].filter(Boolean)
    const results = await zipItAndShipIt.zipFunctions(sourceDirectories, functionsDist, zisiParameters)

    logBundleResults({ logs, results })

    return { bundler }
  } catch (error) {
    throw await getZipError(error, functionsSrc)
  }
}

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
// eslint-disable-next-line complexity
const coreStep = async function ({
  childEnv,
  constants: {
    INTERNAL_FUNCTIONS_SRC: relativeInternalFunctionsSrc,
    IS_LOCAL: isRunningLocally,
    FUNCTIONS_SRC: relativeFunctionsSrc,
    FUNCTIONS_DIST: relativeFunctionsDist,
  },
  buildDir,
  logs,
  netlifyConfig,
  featureFlags,
  repositoryRoot,
}) {
  const functionsSrc = relativeFunctionsSrc === undefined ? undefined : resolve(buildDir, relativeFunctionsSrc)
  const functionsDist = resolve(buildDir, relativeFunctionsDist)
  const internalFunctionsSrc = resolve(buildDir, relativeInternalFunctionsSrc)
  const internalFunctionsSrcExists = await pathExists(internalFunctionsSrc)
  const functionsSrcExists = await validateFunctionsSrc({ functionsSrc, logs, relativeFunctionsSrc })
  const [userFunctions = [], internalFunctions = []] = await getUserAndInternalFunctions({
    featureFlags,
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
    childEnv,
    featureFlags,
    functionsConfig: netlifyConfig.functions,
    functionsDist,
    functionsSrc,
    internalFunctionsSrc,
    isRunningLocally,
    logs,
    repositoryRoot,
  })

  return {
    tags: {
      bundler,
    },
  }
}

// We run this core step if at least one of the functions directories (the
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

export const bundleFunctions = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'functions_bundling',
  coreStepName: 'Functions bundling',
  coreStepDescription: () => 'Functions bundling',
  condition: hasFunctionsDirectories,
}

// Named imports with ES modules cannot be mocked (unlike CommonJS) because
// they are bound at load time.
// However, some of our tests are asserting which arguments are passed to
// `zip-it-and-ship-it` methods. Therefore, we need to use an intermediary
// function and export them so tests can use it.
export const zipItAndShipIt = {
  async zipFunctions(...args) {
    return await zipFunctions(...args)
  },
}
