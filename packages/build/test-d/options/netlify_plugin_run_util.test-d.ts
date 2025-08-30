import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('utils.run types', () => {
  const handler: OnPreBuild = async ({ utils }) => {
    expectTypeOf(utils.run('command')).toExtend<Promise<object>>()

    const r0 = await utils.run('command')
    expectTypeOf(r0).toBeObject()

    await utils.run('command', ['arg'])
    await utils.run('command', ['arg'], { preferLocal: false })

    // @ts-expect-error - TypeScript has no negative-call assertion; this error is the test
    await utils.run('command', ['arg'], { unknownOption: false })

    await utils.run.command('command')
  }

  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
