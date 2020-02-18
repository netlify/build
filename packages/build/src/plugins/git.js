const execa = require('execa')
const filterObj = require('filter-obj')

// Retrieve git-related information for use in environment variables.
// git is optional and there might be not git repository.
// We purposely keep this decoupled from the git utility.
const getGitEnv = async function(baseDir) {
  const [BRANCH, COMMIT_REF, CACHED_COMMIT_REF] = await Promise.all([
    git(['rev-parse', '--abbrev-ref', 'HEAD'], baseDir),
    git(['rev-parse', 'HEAD'], baseDir),
    git(['rev-parse', 'HEAD^'], baseDir),
  ])
  const gitEnv = { BRANCH, HEAD: BRANCH, COMMIT_REF, CACHED_COMMIT_REF }
  const gitEnvA = filterObj(gitEnv, isDefined)
  return gitEnvA
}

const git = async function(args, cwd) {
  try {
    const { stdout } = await execa('git', args, { cwd })
    return stdout
  } catch (error) {
    return
  }
}

const isDefined = function(key, value) {
  return value !== undefined
}

module.exports = { getGitEnv }
