import { join } from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { getBuildInfo } from '../src/node/get-build-info.js'

import { createFixture } from './helpers.js'

afterEach(async ({ cleanup }) => await cleanup?.())

describe('PNPM Workspaces', () => {
  beforeEach(async (ctx) => {
    await createFixture('pnpm-workspace', ctx)
  })

  test('should detect a regular pnpm workspace from a package level', async ({ cwd }) => {
    const info = await getBuildInfo({ projectDir: 'packages/website', rootDir: cwd })
    expect(info.packageManager?.name).toBe('pnpm')
    expect(info.jsWorkspaces?.isRoot).toBe(false)
    expect(info.jsWorkspaces?.packages).toEqual([
      { path: join('packages/blog'), name: '@evilcorp/blog' },
      { path: join('packages/website'), name: '@evilcorp/website' },
    ])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })

  test('should detect a regular pnpm workspace from the root level', async ({ cwd }) => {
    const info = await getBuildInfo({ projectDir: cwd })
    expect(info.packageManager?.name).toBe('pnpm')
    expect(info.jsWorkspaces?.isRoot).toBe(true)
    expect(info.jsWorkspaces?.packages).toEqual([
      { path: join('packages/blog'), name: '@evilcorp/blog' },
      { path: join('packages/website'), name: '@evilcorp/website' },
    ])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })
})

test('should detect a regular pnpm project with a lock file in the root', async (ctx) => {
  const fixture = await createFixture('pnpm-simple', ctx)
  const info = await getBuildInfo({ projectDir: '', rootDir: fixture.cwd })
  expect(info.packageManager?.name).toBe('pnpm')
})

test('should detect a regular pnpm project that is nested in a sub-folder', async (ctx) => {
  const fixture = await createFixture('pnpm-nested', ctx)
  const info = await getBuildInfo({ projectDir: `website`, rootDir: fixture.cwd })
  expect(info.packageManager?.name).toBe('pnpm')
})
