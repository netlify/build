const execa = require('execa')

// Find out git branch among (in priority order):
//   - `branch` option
//   - `BRANCH` environment variable
//   - Running `git`
//   - 'master' (fallback)
const getBranch = async function({ branch, repositoryRoot }) {
  if (branch) {
    return branch
  }

  const gitBranch = await getGitBranch(repositoryRoot)
  if (gitBranch !== undefined) {
    return gitBranch
  }

  return FALLBACK_BRANCH
}

const getGitBranch = async function(repositoryRoot) {
  try {
    const { stdout } = await execa.command('git rev-parse --abbrev-ref HEAD', { cwd: repositoryRoot })
    return stdout
  } catch (error) {
    return
  }
}

const FALLBACK_BRANCH = 'master'

module.exports = { getBranch }
