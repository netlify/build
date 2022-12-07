import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { getBuildInfo } from '../src/get-build-info.js'

import { createFixture } from './helpers.js'

const env = { ...process.env }
beforeEach(() => {
  // restore process environment variables
  process.env = { ...env }
})
// run tests inside temp directory to avoid side effects
let cleanup: () => Promise<void>

afterEach(async () => await cleanup())

test('framework info should not crash build-info', async () => {
  const fixture = await createFixture('pnpm-simple')
  cleanup = fixture.cleanup

  vi.mock('@netlify/framework-info', () => ({
    listFrameworks: async () => {
      throw new Error('Crashing hard 💣')
    },
  }))

  const { frameworks, packageManager } = await getBuildInfo({
    projectDir: '',
    rootDir: fixture.cwd,
  })
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
})

test('framework info should not crash build-info and the detection should still work', async () => {
  const fixture = await createFixture('yarn-project')
  cleanup = fixture.cleanup

  vi.mock('@netlify/framework-info', () => ({
    listFrameworks: async () => {
      throw new Error('Crashing hard 💣')
    },
  }))

  process.env.NETLIFY_USE_PNPM = 'true'
  const { frameworks, packageManager } = await getBuildInfo({
    projectDir: '',
    rootDir: fixture.cwd,
  })
  expect(packageManager?.name).toBe('pnpm')
  expect(frameworks).toEqual([])
})
