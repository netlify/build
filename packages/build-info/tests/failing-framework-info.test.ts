import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import * as metrics from '../src/metrics.js'
import { getBuildInfo } from '../src/node/get-build-info.js'

import { createFixture } from './helpers.js'

vi.mock('@netlify/framework-info', () => ({
  listFrameworks: async () => {
    throw new Error('Crashing hard 💣')
  },
}))

const env = { ...process.env }
beforeEach(() => {
  // restore process environment variables
  process.env = { ...env }
})

afterEach(async ({ cleanup }) => await cleanup?.())

test('framework info should not crash build-info', async (ctx) => {
  const metricsSpy = vi.spyOn(metrics, 'report').mockImplementation(vi.fn())
  const fixture = await createFixture('pnpm-simple')
  ctx.cleanup = fixture.cleanup

  const { frameworks, packageManager } = await getBuildInfo({ projectDir: '', rootDir: fixture.cwd })
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
  expect(metricsSpy).toHaveBeenCalledWith(new Error('Crashing hard 💣'), { client: undefined })
})

test('framework info should not crash build-info and the detection should still work', async (ctx) => {
  const metricsSpy = vi.spyOn(metrics, 'report').mockImplementation(vi.fn())
  const fixture = await createFixture('yarn-project')
  ctx.cleanup = fixture.cleanup

  process.env.NETLIFY_USE_PNPM = 'true'
  const { frameworks, packageManager } = await getBuildInfo({ projectDir: '', rootDir: fixture.cwd })
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
  expect(metricsSpy).toHaveBeenCalledWith(new Error('Crashing hard 💣'), { client: undefined })
})
