const process = require('process')

const { isDirectory } = require('path-type')

const { throwError } = require('../error')
const { getBufferLogs } = require('../log/logger')
const { logOpts } = require('../log/main')
const { removeFalsy } = require('../utils/remove_falsy')

const { getBaseOverride } = require('./base')
const { getBranch } = require('./branch')
const { getRepositoryRoot } = require('./repository_root')

// Assign default options
const addDefaultOpts = function(opts = {}) {
  const rawOpts = removeFalsy(opts)
  const defaultOpts = getDefaultOpts(rawOpts)
  const mergedOpts = { ...defaultOpts, ...rawOpts }
  const normalizedOpts = removeFalsy(mergedOpts)

  const logs = getBufferLogs(normalizedOpts)
  const normalizedOptsA = { ...normalizedOpts, logs }

  logOpts(rawOpts, normalizedOptsA)

  return normalizedOptsA
}

const getDefaultOpts = function({ env: envOpt = {}, cwd: cwdOpt, defaultConfig }) {
  const combinedEnv = { ...process.env, ...envOpt }
  return {
    ...getDefaultCwd(cwdOpt),
    env: envOpt,
    context: combinedEnv.CONTEXT || 'production',
    branch: combinedEnv.BRANCH,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    siteId: combinedEnv.NETLIFY_SITE_ID,
    mode: 'require',
    debug: getDefaultDebug(combinedEnv, defaultConfig),
    buffer: false,
  }
}

// --debug can be set using an environment variable `NETLIFY_BUILD_DEBUG` either
// locally or in the UI build settings
const getDefaultDebug = function(combinedEnv, defaultConfig) {
  if (combinedEnv.NETLIFY_BUILD_DEBUG) {
    return true
  }

  try {
    const { build: { environment: { NETLIFY_BUILD_DEBUG } = {} } = {} } = JSON.parse(defaultConfig)
    return Boolean(NETLIFY_BUILD_DEBUG)
  } catch (error) {
    return false
  }
}

// `process.cwd()` can throw, so only call it when needed
const getDefaultCwd = function(cwdOpt) {
  if (cwdOpt !== undefined) {
    return {}
  }

  const cwd = process.cwd()
  return { cwd }
}

// Normalize options
const normalizeOpts = async function(opts) {
  const repositoryRoot = await getRepositoryRoot(opts)
  const optsA = { ...opts, repositoryRoot }

  const branch = await getBranch(optsA)
  const optsB = { ...optsA, branch }

  const optsC = removeFalsy(optsB)
  await checkDirs(optsC)

  const baseOverride = await getBaseOverride(optsC)
  const optsD = { ...baseOverride, ...optsC }
  return optsD
}

// Verify that options point to existing directories
const checkDirs = async function(opts) {
  await Promise.all(DIR_OPTIONS.map(optName => checkDir(opts, optName)))
}

const DIR_OPTIONS = ['cwd', 'repositoryRoot']

const checkDir = async function(opts, optName) {
  const path = opts[optName]
  if (!(await isDirectory(path))) {
    throwError(`Option '${optName}' points to a non-existing directory: ${path}`)
  }
}

module.exports = { addDefaultOpts, normalizeOpts }
