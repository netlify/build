'use strict'

const { resolve } = require('path')
const process = require('process')

const { isDirectory } = require('path-type')

const { throwError } = require('../error')
const { getBufferLogs } = require('../log/logger')
const { logOpts } = require('../log/main')
const { removeFalsy } = require('../utils/remove_falsy')

const { getBaseOverride } = require('./base')
const { getBranch } = require('./branch')
const { DEFAULT_FEATURE_FLAGS } = require('./feature_flags')
const { getRepositoryRoot } = require('./repository_root')

// Assign default options
const addDefaultOpts = function (opts = {}) {
  const rawOpts = removeFalsy(opts)

  const defaultOpts = getDefaultOpts(rawOpts)
  const mergedOpts = {
    ...defaultOpts,
    ...rawOpts,
    featureFlags: { ...defaultOpts.featureFlags, ...rawOpts.featureFlags },
  }
  const normalizedOpts = removeFalsy(mergedOpts)

  const logs = getBufferLogs(normalizedOpts)
  const normalizedOptsA = { ...normalizedOpts, logs }

  logOpts(rawOpts, normalizedOptsA)

  return normalizedOptsA
}

const getDefaultOpts = function ({ env: envOpt = {}, cwd: cwdOpt, defaultConfig = {} }) {
  const combinedEnv = { ...process.env, ...envOpt }
  return {
    defaultConfig,
    ...getDefaultCwd(cwdOpt),
    env: envOpt,
    context: combinedEnv.CONTEXT || 'production',
    branch: combinedEnv.BRANCH,
    host: combinedEnv.NETLIFY_API_HOST,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    siteId: combinedEnv.NETLIFY_SITE_ID,
    deployId: combinedEnv.DEPLOY_ID,
    mode: 'require',
    offline: false,
    debug: getDefaultDebug(combinedEnv, defaultConfig),
    buffer: false,
    featureFlags: DEFAULT_FEATURE_FLAGS,
  }
}

// --debug can be set using an environment variable `NETLIFY_BUILD_DEBUG` either
// locally or in the UI build settings
const getDefaultDebug = function (combinedEnv, { build: { environment = {} } = {} }) {
  return Boolean(combinedEnv.NETLIFY_BUILD_DEBUG || environment.NETLIFY_BUILD_DEBUG)
}

// `process.cwd()` can throw, so only call it when needed
const getDefaultCwd = function (cwdOpt) {
  if (cwdOpt !== undefined) {
    return {}
  }

  const cwd = process.cwd()
  return { cwd }
}

// Normalize options
const normalizeOpts = async function (opts) {
  const repositoryRoot = await getRepositoryRoot(opts)
  const optsA = { ...opts, repositoryRoot }

  const branch = await getBranch(optsA)
  const optsB = { ...optsA, branch }

  const optsC = removeFalsy(optsB)
  const optsD = await normalizeDirs(optsC)

  const baseOverride = await getBaseOverride(optsD)
  const optsE = { ...baseOverride, ...optsD }
  return optsE
}

// Verify that options point to existing directories.
// Also resolve them to absolute file paths.
const normalizeDirs = async function (opts) {
  const dirOpts = await Promise.all(DIR_OPTIONS.map((optName) => normalizeDir(opts, optName)))
  return Object.assign({}, opts, ...dirOpts)
}

const DIR_OPTIONS = ['cwd', 'repositoryRoot']

const normalizeDir = async function (opts, optName) {
  const path = opts[optName]
  const resolvedPath = resolve(path)
  if (!(await isDirectory(path))) {
    throwError(`Option '${optName}' points to a non-existing directory: ${resolvedPath}`)
  }
  return { [optName]: resolvedPath }
}

module.exports = { addDefaultOpts, normalizeOpts }
