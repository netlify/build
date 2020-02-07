const path = require('path')
const util = require('util')

const findUp = require('find-up')
const gitRepoInfo = require('git-repo-info')
const parseGitRemote = require('parse-github-url')
const isEmpty = require('lodash.isempty')
const gitconfiglocal = require('gitconfiglocal')

module.exports = async function detectGitRepo(remote) {
  const cwd = process.cwd()
  let repo = {}
  try {
    const gitConfig = await util.promisify(gitconfiglocal)(cwd)
    const gitDirectory = await findUp(['.git'], { cwd: cwd })
    const baseGitPath = path.dirname(gitDirectory)

    if (cwd !== baseGitPath) {
      console.log(`Git directory located in ${baseGitPath}`)
      // TODO prompt for "is this the correct git remote"?
      // If folder gitignored inside another git repo it could link to wrong repo.
    }

    if (isEmpty(gitConfig) || isEmpty(gitConfig.remote)) {
      throw new Error('No Git remote found')
    }

    if (!remote) {
      remote = Object.prototype.hasOwnProperty.call(gitConfig, 'origin')
        ? 'origin'
        : Object.keys(gitConfig.remote).shift()
    }

    if (!Object.prototype.hasOwnProperty.call(gitConfig.remote, remote) || isEmpty(gitConfig.remote[remote])) {
      throw new Error(
        `The specified remote "${remote}" is not defined in Git repo. Please use --gitRemoteName flag to specify a remote.`,
      )
    }

    const remoteData = parseGitRemote(gitConfig.remote[remote].url)
    const repoData = gitRepoInfo()

    // TODO refactor shape
    repo = {
      gitDirectoryPath: gitDirectory,
      remoteData: remoteData,
      repoData: repoData,
      repo_path: remoteData.path,
      repo_branch: repoData.branch,
      allowed_branches: [repoData.branch],
      host: remoteData.host,
    }

    switch (remoteData.host) {
      case 'github.com': {
        repo.provider = 'github'
        break
      }
      case 'gitlab.com': {
        repo.provider = 'gitlab'
        break
      }
    }
  } catch (error) {
    // console.log('error', error)
    return {
      error: error.message,
    }
  }

  return repo
}
