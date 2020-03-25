const {
  env: { NETLIFY_AUTH_TOKEN },
  execPath,
} = require('process')

const resolveConfig = require('@netlify/config')

const { logFlags, logBuildDir, logConfigPath, logConfig, logContext } = require('../log/main')
const { addErrorInfo } = require('../error/info')
const { removeFalsy } = require('../utils/remove_falsy')

const { getApiClient } = require('./api')
const { getSiteInfo } = require('./site_info')
const { getConstants } = require('./constants')

// Retrieve configuration object
const loadConfig = async function(flags) {
  const flagsA = removeFalsy(flags)
  logFlags(flagsA)

  const flagsB = { ...DEFAULT_FLAGS, ...flagsA }
  const {
    config,
    defaultConfig,
    cachedConfig,
    cwd,
    repositoryRoot,
    dry,
    nodePath,
    token,
    siteId,
    context,
    branch,
    baseRelDir,
  } = removeFalsy(flagsB)

  const { configPath, buildDir, config: netlifyConfig, context: contextA, branch: branchA } = await resolveFullConfig({
    config,
    defaultConfig,
    cachedConfig,
    cwd,
    repositoryRoot,
    context,
    branch,
    baseRelDir,
  })

  const { buildDir: buildDirA, netlifyConfig: netlifyConfigA } = fixDuplicatePaths(buildDir, netlifyConfig)

  logBuildDir(buildDirA)
  logConfigPath(configPath)
  logConfig(netlifyConfigA)
  logContext(contextA)

  const api = getApiClient(token)
  const siteInfo = await getSiteInfo(api, siteId)
  const constants = await getConstants({ configPath, buildDir: buildDirA, netlifyConfig: netlifyConfigA, siteInfo })
  return {
    netlifyConfig: netlifyConfigA,
    configPath,
    buildDir: buildDirA,
    nodePath,
    api,
    token,
    dry,
    siteInfo,
    constants,
    context: contextA,
    branch: branchA,
  }
}

// TODO: temporary hotfix
const fixDuplicatePaths = function(buildDir, { build, ...netlifyConfig }) {
  const buildDirA = fixDuplicatePath(buildDir)
  const buildA = fixDuplicatePathObject(build, 'base')
  const buildB = fixDuplicatePathObject(buildA, 'functions')
  const buildC = fixDuplicatePathObject(buildB, 'publish')
  const netlifyConfigA = { ...netlifyConfig, build: buildC }
  return { buildDir: buildDirA, netlifyConfig: netlifyConfigA }
}

const fixDuplicatePathObject = function(object, propName) {
  const path = object[propName]
  if (path === undefined) {
    return object
  }

  const pathA = fixDuplicatePath(path)
  return { ...object, [propName]: pathA }
}

const fixDuplicatePath = function(path) {
  if (!path.startsWith('/opt/build/repo/opt/build/repo')) {
    return path
  }

  return path.replace('/opt/build/repo', '')
}

// Default values of CLI flags
const DEFAULT_FLAGS = {
  nodePath: execPath,
  token: NETLIFY_AUTH_TOKEN,
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
    })
  } catch (error) {
    if (error.type === 'userError') {
      delete error.type
      addErrorInfo(error, { type: 'resolveConfig' })
    }
    throw error
  }
}

module.exports = { loadConfig }
