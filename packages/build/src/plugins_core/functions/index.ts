import { resolve } from 'path'

import { type NodeBundlerName, RUNTIME, zipFunctions, type FunctionResult } from '@netlify/zip-it-and-ship-it'
import { pathExists } from 'path-exists'

import { addErrorInfo } from '../../error/info.js'
import { log } from '../../log/logger.js'
import { type GeneratedFunction, getGeneratedFunctions } from '../../steps/return_values.js'
import { logBundleResults, logFunctionsNonExistingDir, logFunctionsToBundle } from '../../log/messages/core_steps.js'
import { FRAMEWORKS_API_FUNCTIONS_ENDPOINT } from '../../utils/frameworks_api.js'

import { getZipError } from './error.js'
import { getUserAndInternalFunctions, validateFunctionsSrc } from './utils.js'
import { getZisiParameters } from './zisi.js'

// Get a list of all unique bundlers in this run
const getBundlers = (results: FunctionResult[] = []) =>
  // using a Set to filter duplicates
  new Set(
    results
      .map((bundle) => (bundle.runtime === RUNTIME.JAVASCRIPT ? bundle.bundler : null))
      .filter(Boolean) as NodeBundlerName[],
  )

// see https://docs.netlify.com/functions/trigger-on-events/#available-triggers
const eventTriggeredFunctions = new Set([
  'deploy-building',
  'deploy-succeeded',
  'deploy-failed',
  'deploy-deleted',
  'deploy-locked',
  'deploy-unlocked',
  'submission-created',
  'split-test-activated',
  'split-test-deactivated',
  'split-test-modified',
  'identity-validate',
  'identity-signup',
  'identity-login',
])

const validateCustomRoutes = function (functions: FunctionResult[]) {
  for (const { routes, name, schedule } of functions) {
    if (!routes || routes.length === 0) continue

    if (schedule) {
      const error = new Error(
        `Scheduled functions must not specify a custom path. Please remove the "path" configuration. Learn more about scheduled functions at https://ntl.fyi/custom-path-scheduled-functions.`,
      )
      addErrorInfo(error, { type: 'resolveConfig' })
      throw error
    }

    if (eventTriggeredFunctions.has(name.toLowerCase().replace('-background', ''))) {
      const error = new Error(
        `Event-triggered functions must not specify a custom path. Please remove the "path" configuration or pick a different name for the function. Learn more about event-triggered functions at https://ntl.fyi/custom-path-event-triggered-functions.`,
      )
      addErrorInfo(error, { type: 'resolveConfig' })
      throw error
    }
  }
}

const zipFunctionsAndLogResults = async ({
  branch,
  buildDir,
  childEnv,
  featureFlags,
  functionsConfig,
  functionsDist,
  functionsSrc,
  generatedFunctions,
  frameworkFunctionsSrc,
  internalFunctionsSrc,
  isRunningLocally,
  logs,
  repositoryRoot,
  userNodeVersion,
  systemLog,
}) => {
  const zisiParameters = getZisiParameters({
    branch,
    buildDir,
    childEnv,
    featureFlags,
    functionsConfig,
    functionsDist,
    internalFunctionsSrc,
    isRunningLocally,
    repositoryRoot,
    userNodeVersion,
    systemLog,
  })

  try {
    // Printing an empty line before bundling output.
    log(logs, '')

    const sourceDirectories = [internalFunctionsSrc, frameworkFunctionsSrc, functionsSrc, ...generatedFunctions].filter(
      Boolean,
    )
    const results = await zipItAndShipIt.zipFunctions(sourceDirectories, functionsDist, zisiParameters)

    validateCustomRoutes(results)

    const bundlers = Array.from(getBundlers(results))

    logBundleResults({ logs, results })

    return { bundlers }
  } catch (error) {
    throw await getZipError(error, functionsSrc)
  }
}

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it

const coreStep = async function ({
  childEnv,
  constants: {
    INTERNAL_FUNCTIONS_SRC: relativeInternalFunctionsSrc,
    IS_LOCAL: isRunningLocally,
    FUNCTIONS_SRC: relativeFunctionsSrc,
    FUNCTIONS_DIST: relativeFunctionsDist,
  },
  buildDir,
  branch,
  packagePath,
  logs,
  netlifyConfig,
  featureFlags,
  repositoryRoot,
  userNodeVersion,
  systemLog,
  returnValues,
}) {
  const functionsSrc = relativeFunctionsSrc === undefined ? undefined : resolve(buildDir, relativeFunctionsSrc)
  const functionsDist = resolve(buildDir, relativeFunctionsDist)
  const internalFunctionsSrc = resolve(buildDir, relativeInternalFunctionsSrc)
  const internalFunctionsSrcExists = await pathExists(internalFunctionsSrc)
  const frameworkFunctionsSrc = resolve(buildDir, packagePath || '', FRAMEWORKS_API_FUNCTIONS_ENDPOINT)
  const frameworkFunctionsSrcExists = await pathExists(frameworkFunctionsSrc)
  const functionsSrcExists = await validateFunctionsSrc({ functionsSrc, relativeFunctionsSrc })
  const [userFunctions = [], internalFunctions = [], frameworkFunctions = []] = await getUserAndInternalFunctions({
    featureFlags,
    functionsSrc,
    functionsSrcExists,
    internalFunctionsSrc,
    internalFunctionsSrcExists,
    frameworkFunctionsSrc,
    frameworkFunctionsSrcExists,
  })

  if (functionsSrc && !functionsSrcExists) {
    logFunctionsNonExistingDir(logs, relativeFunctionsSrc)

    if (internalFunctions.length !== 0) {
      log(logs, '')
    }
  }

  const generatedFunctions = getGeneratedFunctions(returnValues)

  logFunctionsToBundle({
    logs,
    userFunctions,
    userFunctionsSrc: relativeFunctionsSrc,
    userFunctionsSrcExists: functionsSrcExists,
    internalFunctions,
    internalFunctionsSrc: relativeInternalFunctionsSrc,
    frameworkFunctions,
    generatedFunctions: getGeneratedFunctionsByGenerator(generatedFunctions),
  })

  if (
    userFunctions.length === 0 &&
    internalFunctions.length === 0 &&
    frameworkFunctions.length === 0 &&
    generatedFunctions.length === 0
  ) {
    return {}
  }

  const { bundlers } = await zipFunctionsAndLogResults({
    branch,
    buildDir,
    childEnv,
    featureFlags,
    functionsConfig: netlifyConfig.functions,
    functionsDist,
    functionsSrc,
    frameworkFunctionsSrc,
    internalFunctionsSrc,
    isRunningLocally,
    logs,
    repositoryRoot,
    userNodeVersion,
    systemLog,
    generatedFunctions: generatedFunctions.map((func) => func.path),
  })

  const metrics = getMetrics(internalFunctions, userFunctions)

  return {
    tags: {
      bundler: bundlers,
    },
    metrics,
  }
}

// We run this core step if at least one of the functions directories (the
// one configured by the user or the internal one) exists. We use a dynamic
// `condition` because the directories might be created by the build command
// or plugins.
const hasFunctionsDirectories = async function ({
  buildDir,
  constants: { INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC },
  packagePath,
  returnValues,
}) {
  const hasFunctionsSrc = FUNCTIONS_SRC !== undefined && FUNCTIONS_SRC !== ''

  if (hasFunctionsSrc) {
    return true
  }

  const internalFunctionsSrc = resolve(buildDir, INTERNAL_FUNCTIONS_SRC)

  if (await pathExists(internalFunctionsSrc)) {
    return true
  }

  const frameworkFunctionsSrc = resolve(buildDir, packagePath || '', FRAMEWORKS_API_FUNCTIONS_ENDPOINT)

  if (await pathExists(frameworkFunctionsSrc)) {
    return true
  }

  // We must run the core step if the return value of any of the previous steps
  // has declared generated functions.
  for (const id in returnValues) {
    if (returnValues[id].generatedFunctions && returnValues[id].generatedFunctions.length !== 0) {
      return true
    }
  }

  return false
}

// Takes a list of return values and produces an object with the names of the
// generated functions for each generator. This is used for printing logs only.
const getGeneratedFunctionsByGenerator = (
  generatedFunctions: GeneratedFunction[],
): Record<string, GeneratedFunction[]> => {
  const result: Record<string, GeneratedFunction[]> = {}

  for (const func of generatedFunctions) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    result[func.generator.name] = result[func.generator.name] || []
    result[func.generator.name].push(func)
  }

  return result
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
  async zipFunctions(...args: Parameters<typeof zipFunctions>): Promise<FunctionResult[]> {
    return await zipFunctions(...args)
  },
}

const getMetrics = (internalFunctions: string[], userFunctions: string[]) => {
  return [
    {
      type: 'increment',
      name: 'buildbot.build.functions',
      value: internalFunctions.length,
      tags: { type: 'lambda:generated' },
    },
    {
      type: 'increment',
      name: 'buildbot.build.functions',
      value: userFunctions.length,
      tags: { type: 'lambda:user' },
    },
  ]
}
