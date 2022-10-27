import { sep } from 'path'

import { afterEach, beforeEach, expect, test } from 'vitest'

import { getBuildInfo } from '../src/get-build-info.js'

import { createFixture } from './helpers.js'

let cwd: string
let cleanup: () => Promise<void>

beforeEach(async () => {
  const fixture = await createFixture('pnpm-workspace')
  cwd = fixture.cwd
  cleanup = fixture.cleanup
})

afterEach(async () => await cleanup())

test('should detect a regular pnpm workspace from a package level', async () => {
  const info = await getBuildInfo({ projectDir: 'packages/website', rootDir: cwd })
  expect(info.packageManager?.name).toBe('pnpm')
  expect(info.jsWorkspaces?.isRoot).toBe(false)
  expect(info.jsWorkspaces?.packages).toEqual([`packages${sep}blog`, `packages${sep}website`])
  expect(info.jsWorkspaces?.rootDir).toBe(cwd)
})

test('should detect a regular pnpm workspace from the root level', async () => {
  const info = await getBuildInfo({ projectDir: cwd })
  expect(info.packageManager?.name).toBe('pnpm')
  expect(info.jsWorkspaces?.isRoot).toBe(true)
  expect(info.jsWorkspaces?.packages).toEqual([`packages${sep}blog`, `packages${sep}website`])
  expect(info.jsWorkspaces?.rootDir).toBe(cwd)
})
