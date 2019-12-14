const { readFileSync } = require('fs')

const { gitJSONToGitDSL } = require('./git/gitJSONToGitDSL')
const { diffToGitJSONDSL } = require('./git/diffToGitJSONDSL')
const { localGetDiff } = require('./git/localGetDiff')
const { localGetFileAtSHA } = require('./git/localGetFileAtSHA')
const { localGetCommits } = require('./git/localGetCommits')

class LocalGit {
  constructor(options) {
    this.options = options
    this.getFileContents = path => {
      return new Promise(res => res(readFileSync(path, 'utf8')))
    }
    this.name = 'local git'
  }
  async getGitDiff() {
    if (this.gitDiff) {
      return this.gitDiff
    }
    const base = this.options.base || 'master'
    const head = 'HEAD'
    try {
      this.gitDiff = await localGetDiff(base, head)
    } catch (err) {
      console.log('diff error', err)
      this.gitDiff = ''
    }
    return this.gitDiff
  }
  async validateThereAreChanges() {
    const diff = await this.getGitDiff()
    return diff.trim().length > 0
  }
  async getPlatformReviewDSLRepresentation() {
    return null
  }
  async getPlatformGitRepresentation() {
    const base = this.options.base || 'master'
    const head = 'HEAD'
    const diff = await this.getGitDiff()
    // Array of commits
    const commits = await localGetCommits(base, head)
    const gitJSON = diffToGitJSONDSL(diff, commits)
    const config = {
      repo: process.cwd(),
      baseSHA: this.options.base || 'master',
      headSHA: 'HEAD',
      getFileContents: localGetFileAtSHA,
      getFullDiff: localGetDiff,
    }
    return gitJSONToGitDSL(gitJSON, config)
  }
}

module.exports.LocalGit = LocalGit
