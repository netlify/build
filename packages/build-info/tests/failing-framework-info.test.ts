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
  const fixture = await createFixture('pnpm-simple', ctx)
  const { frameworks, packageManager, settings } = await getBuildInfo({
    projectDir: '',
    rootDir: fixture.cwd,
    featureFlags: {
      build_info_new_framework_detection: false,
    },
  })
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
  expect(settings).toEqual([])
  expect(metricsSpy).toHaveBeenCalledWith(new Error('Crashing hard 💣'), { client: undefined })
})

test('framework info should not crash build-info and the detection should still work', async (ctx) => {
  const metricsSpy = vi.spyOn(metrics, 'report').mockImplementation(vi.fn())
  const fixture = await createFixture('yarn-project', ctx)

  process.env.NETLIFY_USE_PNPM = 'true'
  const { frameworks, packageManager } = await getBuildInfo({
    projectDir: '',
    rootDir: fixture.cwd,
    featureFlags: {
      build_info_new_framework_detection: false,
    },
  })
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
  expect(metricsSpy).toHaveBeenCalledWith(new Error('Crashing hard 💣'), { client: undefined })
})
