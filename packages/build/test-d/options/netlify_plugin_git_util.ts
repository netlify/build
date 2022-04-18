import { NetlifyPluginUtils, OnPreBuild } from '@netlify/build'
import { expectType } from 'tsd'

const testUtilsGit: OnPreBuild = function ({ utils: { git } }: { utils: NetlifyPluginUtils }) {
  expectType<readonly string[]>(git.fileMatch('*'))
  expectType<readonly string[]>(git.modifiedFiles)
  expectType<readonly string[]>(git.createdFiles)
  expectType<readonly string[]>(git.deletedFiles)
  expectType<Promise<number>>(git.linesOfCode())
}

const testUtilsGitCommits: OnPreBuild = function ({
  utils: {
    git: {
      commits: [commit],
    },
  },
}: {
  utils: NetlifyPluginUtils
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
