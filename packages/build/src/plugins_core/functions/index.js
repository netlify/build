import { join, resolve } from 'path'

import { zipFunctions } from '@netlify/zip-it-and-ship-it'
import mapObject from 'map-obj'
import pathExists from 'path-exists'

import { log } from '../../log/logger.js'
import { logBundleResults, logFunctionsNonExistingDir, logFunctionsToBundle } from '../../log/messages/core_steps.js'

import { getZipError } from './error.js'
import { getZisiFeatureFlags } from './feature_flags.js'
import { getUserAndInternalFunctions, validateFunctionsSrc } from './utils.js'

// Returns `true` if at least one of the functions has been configured to use
// esbuild.
const isUsingEsbuild = (functionsConfig = {}) =>
  Object.values(functionsConfig).some((configObject) => configObject.node_bundler === 'esbuild')

// The function configuration keys returned by @netlify/config are not an exact
// match to the properties that @netlify/zip-it-and-ship-it expects. We do that
// translation here.
const normalizeFunctionConfig = ({ buildDir, functionConfig = {}, isRunningLocally }) => ({
  externalNodeModules: functionConfig.external_node_modules,
  includedFiles: functionConfig.included_files,
  includedFilesBasePath: buildDir,
  ignoredNodeModules: functionConfig.ignored_node_modules,
  schedule: functionConfig.schedule,

  // When the user selects esbuild as the Node bundler, we still want to use
  // the legacy ZISI bundler as a fallback. Rather than asking the user to
  // make this decision, we abstract that complexity away by injecting the
  // fallback behavior ourselves. We do this by transforming the value
  // `esbuild` into `esbuild_zisi`, which zip-it-and-ship-it understands.
  nodeBundler: functionConfig.node_bundler === 'esbuild' ? 'esbuild_zisi' : functionConfig.node_bundler,

  // If the build is running in buildbot, we set the Rust target directory to a
  // path that will get cached in between builds, allowing us to speed up the
  // build process.
  rustTargetDirectory: isRunningLocally ? undefined : resolve(buildDir, '.netlify', 'rust-functions-cache', '[name]'),

  // Go functions should be zipped only when building locally. When running in
  // buildbot, the Go API client will handle the zipping.
  zipGo: isRunningLocally ? true : undefined,
})

const getZisiParameters = ({
  buildDir,
  featureFlags,
  functionsConfig,
  functionsDist,
  isRunningLocally,
  repositoryRoot,
}) => {
  const isManifestEnabled = isRunningLocally || featureFlags.buildbot_create_functions_manifest === true
  const manifest = isManifestEnabled ? join(functionsDist, 'manifest.json') : undefined
  const config = mapObject(functionsConfig, (expression, object) => [
    expression,
    normalizeFunctionConfig({ buildDir, featureFlags, functionConfig: object, isRunningLocally }),
  ])
  const zisiFeatureFlags = getZisiFeatureFlags(featureFlags)

  return { basePath: buildDir, config, manifest, featureFlags: zisiFeatureFlags, repositoryRoot }
}

const zipFunctionsAndLogResults = async ({
  buildDir,
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
