'use strict'

const { join, resolve } = require('path')

// We can't use destructuring for zisi as we rely on spies for the `zipFunctions` method within our tests
const zipItAndShipIt = require('@netlify/zip-it-and-ship-it')
const mapObject = require('map-obj')
const pathExists = require('path-exists')

const { log } = require('../../log/logger')
const { logBundleResults, logFunctionsNonExistingDir, logFunctionsToBundle } = require('../../log/messages/core_steps')

const { getZipError } = require('./error')
const { getZisiFeatureFlags } = require('./feature_flags')
const { getUserAndInternalFunctions, validateFunctionsSrc } = require('./utils')

// Returns `true` if at least one of the functions has been configured to use
// esbuild.
const isUsingEsbuild = (functionsConfig = {}) =>
  Object.values(functionsConfig).some((configObject) => configObject.node_bundler === 'esbuild')

// The function configuration keys returned by @netlify/config are not an exact
// match to the properties that @netlify/zip-it-and-ship-it expects. We do that
// translation here.
const normalizeFunctionConfig = ({ buildDir, featureFlags, functionConfig = {}, isRunningLocally }) => ({
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

  // If the build is running in buildbot, we set the Rust target directory to a
  // path that will get cached in between builds, allowing us to speed up the
  // build process.
  rustTargetDirectory: isRunningLocally ? undefined : resolve(buildDir, '.netlify', 'rust-functions-cache', '[name]'),

  schedule: featureFlags.buildbot_scheduled_functions ? functionConfig.schedule : undefined,
})

const getZisiParameters = ({
  buildDir,
  featureFlags,
  functionsConfig,
  functionsDist,
  isRunningLocally,
  repositoryRoot,
}) => {
  const isManifestEnabled = featureFlags.functionsBundlingManifest === true
  const manifest = isManifestEnabled && isRunningLocally ? join(functionsDist, 'manifest.json') : undefined
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

const bundleFunctions = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'functions_bundling',
  coreStepName: 'Functions bundling',
  coreStepDescription: () => 'Functions bundling',
  condition: hasFunctionsDirectories,
}

module.exports = { bundleFunctions }
