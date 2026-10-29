import { resolve } from 'path'
import process from 'process'

import { isDirectory } from 'path-type'

import { throwUserError } from '../error.js'
import { getBufferLogs } from '../log/logger.js'
import { logOpts } from '../log/main.js'
import { removeFalsy } from '../utils/remove_falsy.js'

import { getBaseOverride } from './base.js'
import { getBranch } from './branch.js'
import { DEFAULT_FEATURE_FLAGS } from './feature_flags.js'
import { getRepositoryRoot } from './repository_root.js'

// Assign default options
export const addDefaultOpts = function (opts = {}) {
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
    deployId: combinedEnv.DEPLOY_ID || DEFAULT_DEPLOY_ID,
    skewProtectionToken: combinedEnv.NETLIFY_SKEW_PROTECTION_TOKEN,
    buildId: combinedEnv.BUILD_ID || DEFAULT_BUILD_ID,
    mode: 'require',
    offline: false,
    debug: getDefaultDebug(combinedEnv, defaultConfig),
    buffer: false,
    featureFlags: DEFAULT_FEATURE_FLAGS,
    inlineConfig: {},
    configMutations: [],
  }
}

// Local builds do not have any deploys, so some dummy ids are used instead
const DEFAULT_DEPLOY_ID = '0'
const DEFAULT_BUILD_ID = '0'

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
/** @returns {Promise<$TSFixMe>} */
export const normalizeOpts = async function (opts) {
  const cwd = await normalizeDir(opts.cwd, 'cwd')
  const rawRepositoryRoot = await getRepositoryRoot({ ...opts, cwd })
  const repositoryRoot = await normalizeDir(rawRepositoryRoot, 'repositoryRoot')
  const branch = await getBranch({ ...opts, repositoryRoot })

  const optsA = removeFalsy({ ...opts, cwd, repositoryRoot, branch })
  const baseOverride = await getBaseOverride(optsA)
  return { ...baseOverride, ...optsA }
}

// Verify that an option points to an existing directory.
// Also resolve it to an absolute file path.
const normalizeDir = async function (path, optName) {
  const resolvedPath = resolve(path)
  if (!(await isDirectory(path))) {
    throwUserError(`Option '${optName}' points to a non-existing directory: ${resolvedPath}`)
  }
  return resolvedPath
}
