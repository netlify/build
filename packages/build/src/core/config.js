const { env, execPath } = require('process')

const resolveConfig = require('@netlify/config')

const { getChildEnv } = require('../env/main')
const { addApiErrorHandlers } = require('../error/api')
const { addErrorInfo } = require('../error/info')
const { logFlags, logBuildDir, logConfigPath, logConfig, logContext } = require('../log/main')
const { getPackageJson } = require('../utils/package')
const { removeFalsy } = require('../utils/remove_falsy')

const { getConstants } = require('./constants')

// Normalize CLI flags
const normalizeFlags = function(flags, logs) {
  const rawFlags = removeFalsy(flags)
  const defaultFlags = getDefaultFlags(rawFlags)
  const mergedFlags = { ...defaultFlags, ...rawFlags }
  const normalizedFlags = removeFalsy(mergedFlags)

  logFlags(logs, rawFlags, normalizedFlags)

  return normalizedFlags
}

// Default values of CLI flags
const getDefaultFlags = function({ env: envOpt = {} }) {
  const combinedEnv = { ...env, ...envOpt }
  return {
    env: envOpt,
    nodePath: execPath,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    mode: 'require',
    functionsDistDir: DEFAULT_FUNCTIONS_DIST,
    deployId: combinedEnv.DEPLOY_ID,
    debug: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG),
    bugsnagKey: combinedEnv.BUGSNAG_KEY,
    telemetry: !combinedEnv.BUILD_TELEMETRY_DISABLED,
    testOpts: {},
  }
}

const DEFAULT_FUNCTIONS_DIST = '.netlify/functions/'

// Retrieve configuration object
const loadConfig = async function({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  functionsDistDir,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  env: envOpt,
  debug,
  mode,
  deployId,
  logs,
  testOpts,
}) {
  const {
    configPath,
    buildDir,
    config: netlifyConfig,
    context: contextA,
    branch: branchA,
    api,
    siteInfo,
  } = await resolveFullConfig({
    config,
    defaultConfig,
    cachedConfig,
    cwd,
    repositoryRoot,
    context,
    branch,
    baseRelDir,
    token,
    siteId,
    mode,
    envOpt,
    testOpts,
  })
  logConfigInfo({ logs, configPath, buildDir, netlifyConfig, context: contextA, debug })

  const apiA = addApiErrorHandlers(api)
  const [constants, childEnv, { packageJson: sitePackageJson }] = await Promise.all([
    getConstants({ configPath, buildDir, functionsDistDir, netlifyConfig, siteInfo, mode }),
    getChildEnv({ netlifyConfig, buildDir, context: contextA, branch: branchA, siteInfo, deployId, envOpt, mode }),
    getPackageJson(buildDir, { normalize: false }),
  ])

  return { netlifyConfig, configPath, buildDir, childEnv, sitePackageJson, api: apiA, siteInfo, constants }
}

const logConfigInfo = function({ logs, configPath, buildDir, netlifyConfig, context, debug }) {
  logBuildDir(logs, buildDir)
  logConfigPath(logs, configPath)
  logConfig({ logs, netlifyConfig, debug })
  logContext(logs, context)
}

// Retrieve configuration file and related information
// (path, build directory, etc.)
const resolveFullConfig = async function({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  context,
  branch,
  baseRelDir,
  token,
  siteId,
  mode,
  envOpt,
  testOpts,
}) {
  try {
    return await resolveConfig({
      config,
      defaultConfig,
      cachedConfig,
      cwd,
      repositoryRoot,
      context,
      branch,
      baseRelDir,
      token,
      siteId,
      mode,
      env: envOpt,
      testOpts,
    })
  } catch (error) {
    if (error.type === 'userError') {
      delete error.type
      addErrorInfo(error, { type: 'resolveConfig' })
    }
    throw error
  }
}

module.exports = { normalizeFlags, loadConfig }
