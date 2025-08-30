import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('utils.git types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const matched = utils.git.fileMatch('*')
    expectTypeOf(matched).toEqualTypeOf<readonly string[]>()

    expectTypeOf(utils.git.modifiedFiles).toEqualTypeOf<readonly string[]>()
    expectTypeOf(utils.git.createdFiles).toEqualTypeOf<readonly string[]>()
    expectTypeOf(utils.git.deletedFiles).toEqualTypeOf<readonly string[]>()

    const loc = utils.git.linesOfCode()
    expectTypeOf(loc).toEqualTypeOf<Promise<number>>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.git commits types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const [commit] = utils.git.commits

    expectTypeOf(commit.sha).toEqualTypeOf<string>()
    expectTypeOf(commit.parents).toEqualTypeOf<string>()
    expectTypeOf(commit.author.name).toEqualTypeOf<string>()
    expectTypeOf(commit.author.email).toEqualTypeOf<string>()
    expectTypeOf(commit.author.date).toEqualTypeOf<string>()
    expectTypeOf(commit.committer.name).toEqualTypeOf<string>()
    expectTypeOf(commit.committer.email).toEqualTypeOf<string>()
    expectTypeOf(commit.committer.date).toEqualTypeOf<string>()
    expectTypeOf(commit.message).toEqualTypeOf<string>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
