const {
  cwd: getCwd,
  env: { CONTEXT, TEST_CACHE_PATH },
} = require('process')

const pathExists = require('path-exists')

const { throwError } = require('../error')
const { removeFalsy } = require('../utils/remove_falsy')
const isNetlifyCI = require('../utils/is-netlify-ci')

const { getRepositoryRoot } = require('./repository_root')
const { getBranch } = require('./branch')

// Normalize options and assign default values
const normalizeOpts = async function(opts) {
  const optsA = removeFalsy(opts)
  const optsB = { ...DEFAULT_CONFIG_OPTS, ...DEFAULT_OPTS, ...optsA }

  const repositoryRoot = await getRepositoryRoot(optsB)
  const optsC = { ...optsB, repositoryRoot }

  const branch = await getBranch(optsC)
  const optsD = { ...optsC, branch }

  const optsE = removeFalsy(optsD)
  await checkPaths(optsE)
  return optsE
}

const DEFAULT_OPTS = {
  cwd: getCwd(),
  context: CONTEXT || 'production',
  baseRelDir: true,
}

// Temporary fix. At the moment, the buildbot is passing the
// "Base directory" UI setting to Netlify Build by changing the current
// directory. The current logic though assumes it is using `defaultConfig`
// for it instead.
// Until `defaultConfig` is used (therefore skipping the following code),
// we use the following workaround.
// TODO: remove it once the buildbot starts using `defaultConfig`.
const DEFAULT_CONFIG_OPTS =
  // Ensure we are not in a local build or running unit tests
  isNetlifyCI() && !TEST_CACHE_PATH
    ? {
        defaultConfig: JSON.stringify({ build: { base: getCwd() } }),
      }
    : {}

// Verify that options point to existing paths
const checkPaths = async function(opts) {
  await Promise.all(PATH_NAMES.map(pathName => checkPath(opts, pathName)))
}

const PATH_NAMES = ['cwd', 'repositoryRoot']

const checkPath = async function(opts, pathName) {
  const path = opts[pathName]
  if (!(await pathExists(path))) {
    throwError(`Option '${pathName}' points to a non-existing file`)
  }
}

module.exports = { normalizeOpts }
