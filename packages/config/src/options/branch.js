'use strict'

const execa = require('execa')

// Find out git branch among (in priority order):
//   - `branch` option
//   - `BRANCH` environment variable
//   - `HEAD` branch (using `git`)
//   - `main` (using `git`)
//   - 'master' (fallback)
const getBranch = async function ({ branch, repositoryRoot }) {
  if (branch) {
    return branch
  }

  const headBranch = await getGitBranch(repositoryRoot, 'HEAD')
  if (headBranch !== undefined) {
    return headBranch
  }

  const mainBranch = await getGitBranch(repositoryRoot, 'main')
  if (mainBranch !== undefined) {
    return mainBranch
  }

  return FALLBACK_BRANCH
}

const getGitBranch = async function (repositoryRoot, gitRef) {
  try {
    const { stdout } = await execa.command(`git rev-parse --abbrev-ref ${gitRef}`, { cwd: repositoryRoot })
    return stdout
  } catch (error) {}
}

const FALLBACK_BRANCH = 'master'

module.exports = { getBranch }
