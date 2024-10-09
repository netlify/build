import { resolve } from 'path'

import { NodeBundlerName, RUNTIME, zipFunctions, ZippedFunctions } from '@netlify/zip-it-and-ship-it'
import { pathExists } from 'path-exists'

import { addErrorInfo } from '../../error/info.js'
import { log } from '../../log/logger.js'
import { logBundleResults, logFunctionsNonExistingDir, logFunctionsToBundle } from '../../log/messages/core_steps.js'
import { FRAMEWORKS_API_FUNCTIONS_ENDPOINT } from '../../utils/frameworks_api.js'

import { getZipError } from './error.js'
import { getUserAndInternalFunctions, validateFunctionsSrc } from './utils.js'
import { getZisiParameters } from './zisi.js'

// Get a list of all unique bundlers in this run
const getBundlers = (results: ZippedFunctions = []) =>
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

const validateCustomRoutes = function (functions: ZippedFunctions) {
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
  buildDir,
  childEnv,
  featureFlags,
  functionsConfig,
  functionsDist,
  functionsSrc,
  frameworkFunctionsSrc,
  internalFunctionsSrc,
  isRunningLocally,
  logs,
  repositoryRoot,
  userNodeVersion,
  systemLog,
}) => {
  const zisiParameters = getZisiParameters({
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

    const sourceDirectories = [internalFunctionsSrc, frameworkFunctionsSrc, functionsSrc].filter(Boolean)
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
  packagePath,
  logs,
  netlifyConfig,
  featureFlags,
  repositoryRoot,
  userNodeVersion,
  systemLog,
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

  logFunctionsToBundle({
    logs,
    userFunctions,
    userFunctionsSrc: relativeFunctionsSrc,
    userFunctionsSrcExists: functionsSrcExists,
    internalFunctions,
    internalFunctionsSrc: relativeInternalFunctionsSrc,
    frameworkFunctions,
  })

  if (userFunctions.length === 0 && internalFunctions.length === 0 && frameworkFunctions.length === 0) {
    return {}
  }

  const { bundlers } = await zipFunctionsAndLogResults({
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
  featureFlags,
  packagePath,
}) {
  const hasFunctionsSrc = FUNCTIONS_SRC !== undefined && FUNCTIONS_SRC !== ''

  if (hasFunctionsSrc) {
    return true
  }

  const internalFunctionsSrc = resolve(buildDir, INTERNAL_FUNCTIONS_SRC)

  if (await pathExists(internalFunctionsSrc)) {
    return true
  }

  if (featureFlags.netlify_build_frameworks_api) {
    const frameworkFunctionsSrc = resolve(buildDir, packagePath || '', FRAMEWORKS_API_FUNCTIONS_ENDPOINT)

    return await pathExists(frameworkFunctionsSrc)
  }

  return false
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
  async zipFunctions(...args: Parameters<typeof zipFunctions>) {
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
