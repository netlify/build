const execa = require('execa')

const { removeFalsy } = require('../utils/remove_falsy')

// Retrieve git-related information for use in environment variables.
// git is optional and there might be not git repository.
// We purposely keep this decoupled from the git utility.
const getGitEnv = async function(buildDir, branch) {
  const [COMMIT_REF, CACHED_COMMIT_REF] = await Promise.all([
    git(['rev-parse', 'HEAD'], buildDir),
    git(['rev-parse', 'HEAD^'], buildDir),
  ])
  const gitEnv = { BRANCH: branch, HEAD: branch, COMMIT_REF, CACHED_COMMIT_REF, PULL_REQUEST: 'false' }
  const gitEnvA = removeFalsy(gitEnv)
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

module.exports = { getGitEnv }
