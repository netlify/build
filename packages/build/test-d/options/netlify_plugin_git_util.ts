import { expectType } from 'tsd'

import { onPreBuild } from '../netlify_plugin'

const testUtilsGit: onPreBuild = function ({ utils: { git } }) {
  expectType<readonly string[]>(git.fileMatch('*'))
  expectType<readonly string[]>(git.modifiedFiles)
  expectType<readonly string[]>(git.createdFiles)
  expectType<readonly string[]>(git.deletedFiles)
  expectType<Promise<number>>(git.linesOfCode())
}

const testUtilsGitCommits: onPreBuild = function ({
  utils: {
    git: {
      commits: [commit],
    },
  },
}) {
  expectType<string>(commit.sha)
  expectType<string>(commit.parents)
  expectType<string>(commit.author.name)
  expectType<string>(commit.author.email)
  expectType<string>(commit.author.date)
  expectType<string>(commit.committer.name)
  expectType<string>(commit.committer.email)
  expectType<string>(commit.committer.date)
  expectType<string>(commit.message)
}
