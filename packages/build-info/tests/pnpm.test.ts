import { join } from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { getBuildInfo } from '../src/node/get-build-info.js'

import { createFixture } from './helpers.js'

afterEach(async ({ cleanup }) => await cleanup?.())

describe('PNPM Workspaces', () => {
  beforeEach(async (ctx) => {
    const fixture = await createFixture('pnpm-workspace')
    ctx.cwd = fixture.cwd
    ctx.cleanup = fixture.cleanup
  })

  test('should detect a regular pnpm workspace from a package level', async ({ cwd }) => {
    const info = await getBuildInfo('packages/website', cwd)
    expect(info.packageManager?.name).toBe('pnpm')
    expect(info.jsWorkspaces?.isRoot).toBe(false)
    expect(info.jsWorkspaces?.packages).toEqual([join(cwd, 'packages/blog'), join(cwd, 'packages/website')])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })

  test('should detect a regular pnpm workspace from the root level', async ({ cwd }) => {
    const info = await getBuildInfo(cwd)
    expect(info.packageManager?.name).toBe('pnpm')
    expect(info.jsWorkspaces?.isRoot).toBe(true)
    expect(info.jsWorkspaces?.packages).toEqual([join(cwd, 'packages/blog'), join(cwd, 'packages/website')])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })
})

test('should detect a regular pnpm project with a lock file in the root', async (ctx) => {
  const fixture = await createFixture('pnpm-simple')
  ctx.cleanup = fixture.cleanup

  const info = await getBuildInfo('', fixture.cwd)
  expect(info.packageManager?.name).toBe('pnpm')
})

test('should detect a regular pnpm project that is nested in a sub-folder', async (ctx) => {
  const fixture = await createFixture('pnpm-nested')
  ctx.cleanup = fixture.cleanup

  const info = await getBuildInfo(`website`, fixture.cwd)
  expect(info.packageManager?.name).toBe('pnpm')
})
