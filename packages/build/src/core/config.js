const resolveConfig = require('@netlify/config')

const { getChildEnv } = require('../env/main')
const { addApiErrorHandlers } = require('../error/api')
const { addErrorInfo } = require('../error/info')
const { logBuildDir, logConfigPath, logConfig, logContext } = require('../log/main')
const { measureDuration } = require('../time/main')

// Retrieve configuration object
const tLoadConfig = async function({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  envOpt,
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
  const childEnv = await getChildEnv({
    netlifyConfig,
    buildDir,
    context: contextA,
    branch: branchA,
    siteInfo,
    deployId,
    envOpt,
    mode,
  })
  return { netlifyConfig, configPath, buildDir, childEnv, api: apiA, siteInfo }
}

const loadConfig = measureDuration(tLoadConfig, 'run_netlify_build.resolve_config')

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

const logConfigInfo = function({ logs, configPath, buildDir, netlifyConfig, context, debug }) {
  logBuildDir(logs, buildDir)
  logConfigPath(logs, configPath)
  logConfig({ logs, netlifyConfig, debug })
  logContext(logs, context)
}

module.exports = { loadConfig }
