const { cwd: getCwd } = require('process')

const { getBase } = require('./refs')
const { getDiffFiles } = require('./diff')
const { getCommits } = require('./commits')
const { getLinesOfCode } = require('./stats')
const { fileMatch } = require('./match')

// Main entry point to the git utilities
const getGitUtils = async function(
  // istanbul ignore next
  { base, cwd = getCwd() } = {},
) {
  try {
    const baseA = await getBase(base, cwd)
    const properties = await getProperties(baseA, cwd)
    const gitUtils = addMethods(properties)
    return gitUtils
  } catch (error) {
    return getFakeGitUtils(error)
  }
}

const getProperties = async function(base, cwd) {
  const [{ modifiedFiles, createdFiles, deletedFiles }, commits, linesOfCode] = await Promise.all([
    getDiffFiles(base, cwd),
    getCommits(base, cwd),
    getLinesOfCode(base, cwd),
  ])
  return { modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode }
}

const addMethods = function(properties) {
  const fileMatchA = fileMatch.bind(null, properties)
  return { ...properties, fileMatch: fileMatchA }
}

// Initialization might fail for many reasons, including the repository not
// having a `.git` directory or some `git` commands failing.
// However initialization happens at the beginning of the build. At that stage,
// we do not know whether the `git` utility will be used yet. In those cases,
// we don't want to report any errors since the user might not use the utility.
// However we still want to report errors when the user does use the utility.
// We achieve this by using a Proxy.
const getFakeGitUtils = function(error) {
  return new Proxy(
    // We define those so that `Object.keys()` and similar methods still work
    { modifiedFiles: [], createdFiles: [], deletedFiles: [], commits: [], linesOfCode: 0, fileMatch() {} },
    // Intercept any `git.*` referencing and throw the original initialization error instead.
    {
      get() {
        throw error
      },
    },
  )
}

module.exports = getGitUtils
module.exports.load = addMethods
