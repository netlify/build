const process = require('process')

const { isDirectory } = require('path-type')

const { throwError } = require('../error')
const { removeFalsy } = require('../utils/remove_falsy')

const { getBranch } = require('./branch')
const { getRepositoryRoot } = require('./repository_root')

// Assign default options
const addDefaultOpts = function(opts = {}) {
  const optsA = removeFalsy(opts)
  const defaultOpts = getDefaultOpts(optsA)
  const optsB = { ...defaultOpts, ...optsA }
  const optsC = removeFalsy(optsB)
  return optsC
}

const getDefaultOpts = function({ env: envOpt = {}, cwd: cwdOpt }) {
  const combinedEnv = { ...process.env, ...envOpt }
  return {
    ...getDefaultCwd(cwdOpt),
    env: envOpt,
    context: combinedEnv.CONTEXT || 'production',
    branch: combinedEnv.BRANCH,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    mode: 'require',
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
  return optsC
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
