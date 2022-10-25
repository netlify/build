import { afterEach, beforeEach, expect, test } from 'vitest'

import { getBuildInfo } from '../src/get-build-info.js'

import { createFixture } from './helpers.js'

let cwd: string
let cleanup: () => Promise<void>

beforeEach(async () => {
  const fixture = await createFixture('yarn-berry-workspace')
  cwd = fixture.cwd
  cleanup = fixture.cleanup
})

afterEach(async () => await cleanup())

test('should detect a regular yarn workspace from a package level', async () => {
  const info = await getBuildInfo({ projectDir: 'packages/website', rootDir: cwd })
  expect(info.packageManager?.name).toBe('yarn')
  expect(info.jsWorkspaces?.isRoot).toBe(false)
  expect(info.jsWorkspaces?.packages).toEqual(['packages/blog', 'packages/website'])
  expect(info.jsWorkspaces?.rootDir).toBe(cwd)
})

test('should detect a regular yarn workspace from the root level', async () => {
  const info = await getBuildInfo({ projectDir: cwd })
  expect(info.packageManager?.name).toBe('yarn')
  expect(info.jsWorkspaces?.isRoot).toBe(true)
  expect(info.jsWorkspaces?.packages).toEqual(['packages/blog', 'packages/website'])
  expect(info.jsWorkspaces?.rootDir).toBe(cwd)
})
