import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { getBuildInfo } from '../src/node/get-build-info.js'

import { createFixture } from './helpers.js'

const env = { ...process.env }
beforeEach(() => {
  // restore process environment variables
  process.env = { ...env }
})

afterEach(async ({ cleanup }) => await cleanup?.())

test('framework info should not crash build-info', async (ctx) => {
  const fixture = await createFixture('pnpm-simple')
  ctx.cleanup = fixture.cleanup

  vi.mock('@netlify/framework-info', () => ({
    listFrameworks: async () => {
      throw new Error('Crashing hard 💣')
    },
  }))

  const { frameworks, packageManager } = await getBuildInfo('', fixture.cwd)
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
})

test('framework info should not crash build-info and the detection should still work', async (ctx) => {
  const fixture = await createFixture('yarn-project')
  ctx.cleanup = fixture.cleanup

  vi.mock('@netlify/framework-info', () => ({
    listFrameworks: async () => {
      throw new Error('Crashing hard 💣')
    },
  }))

  process.env.NETLIFY_USE_PNPM = 'true'
  const { frameworks, packageManager } = await getBuildInfo('', fixture.cwd)
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
})
