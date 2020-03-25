const { cwd: getCwd } = require('process')

const { getBase, getHead } = require('./refs')
const { getDiffFiles } = require('./diff')
const { getCommits } = require('./commits')
const { getLinesOfCode } = require('./stats')
const { fileMatch } = require('./match')

// Main entry point to the git utilities
const getGitUtils = async function({ base, head, cwd = getCwd() } = {}) {
  try {
    const headA = await getHead(head)
    const baseA = await getBase(base, headA, cwd)
    const properties = await getProperties(baseA, headA, cwd)
    const gitUtils = addMethods(properties)
    return gitUtils
  } catch (error) {
    return { error: error.stack }
  }
}

const getProperties = async function(base, head, cwd) {
  const [{ modifiedFiles, createdFiles, deletedFiles }, commits, linesOfCode] = await Promise.all([
    getDiffFiles(base, head, cwd),
    getCommits(base, head, cwd),
    getLinesOfCode(base, head, cwd),
  ])
  return { modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode }
}

const addMethods = function(properties) {
  // During initialization, the git utility is not built yet since it is a Proxy
  // and the utility must be sent across processes, i.e. JSON-serializable.
  // Instead we only keep the error stack and build the Proxy now.
  if (properties.error !== undefined) {
    return getFakeGitUtils(properties)
  }

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
const getFakeGitUtils = function({ error }) {
  return new Proxy(
    // We define those so that `Object.keys()` and similar methods still work
    {
      modifiedFiles: [],
      createdFiles: [],
      deletedFiles: [],
      commits: [],
      linesOfCode: 0,
      fileMatch() {
        return { modified: [], created: [], deleted: [], edited: [] }
      },
    },
    // Intercept any `git.*` referencing and throw the original initialization error instead.
    {
      get() {
        // Keep stack trace of both original error and `git.*` referencing
        throw new Error(error)
      },
    },
  )
}

module.exports = getGitUtils
module.exports.load = addMethods
