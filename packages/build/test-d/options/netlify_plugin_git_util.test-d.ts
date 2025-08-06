import type { NetlifyPluginUtils } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('utils git types', () => {
  type Git = NetlifyPluginUtils['git']

  expectTypeOf<ReturnType<Git['fileMatch']>>().toEqualTypeOf<readonly string[]>()
  expectTypeOf<Git['modifiedFiles']>().toEqualTypeOf<readonly string[]>()
  expectTypeOf<Git['createdFiles']>().toEqualTypeOf<readonly string[]>()
  expectTypeOf<Git['deletedFiles']>().toEqualTypeOf<readonly string[]>()
  expectTypeOf<ReturnType<Git['linesOfCode']>>().toEqualTypeOf<Promise<number>>()
})

test('utils git commits types', () => {
  type Git = NetlifyPluginUtils['git']
  type Commit = Git['commits'][number]

  expectTypeOf<Commit['sha']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['parents']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['author']['name']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['author']['email']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['author']['date']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['committer']['name']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['committer']['email']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['committer']['date']>().toEqualTypeOf<string>()
  expectTypeOf<Commit['message']>().toEqualTypeOf<string>()
})
