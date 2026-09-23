import { fileURLToPath } from 'url'

import { resolveConfig } from '@netlify/config'
import { expect, test } from 'vitest'

const FIXTURE_DIR = fileURLToPath(new URL('fixtures/empty', import.meta.url))

const resolveInline = (inlineConfig: Record<string, unknown>) =>
  resolveConfig({ cwd: FIXTURE_DIR, repositoryRoot: FIXTURE_DIR, offline: true, buffer: true, inlineConfig })

test('Properties without validation rules are used as is, with a warning', async () => {
  const { config, logs } = await resolveInline({ build: { environment: 'not an object' } })

  expect(config.build.environment).toBe('not an object')
  expect(logs?.stderr.join('\n')).toContain('Unexpected configuration, used as is')
})

test('A build.base that is not a string is reported as invalid', async () => {
  await expect(resolveInline({ build: { base: 5 } })).rejects.toThrow(
    'Configuration property build.base must be a string.',
  )
})

test('A null functions["*"] is reported as invalid', async () => {
  await expect(resolveInline({ functions: { '*': null } })).rejects.toThrow(
    'Configuration property functions.* must be an object.',
  )
})

test('A functions["*"] that is not an object is still spread, as it always has been', async () => {
  const { config } = await resolveInline({ functions: { '*': 'ab' } })

  expect(config.functions['*']).toEqual({ 0: 'a', 1: 'b' })
})
