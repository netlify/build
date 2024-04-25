import { join, sep } from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { getBuildInfo } from '../src/node/get-build-info.js'

import { createFixture } from './helpers.js'

afterEach(async ({ cleanup }) => await cleanup?.())

describe('Yarn Workspaces with yarn berry', () => {
  beforeEach(async (ctx) => {
    await createFixture('yarn-berry-workspace', ctx)
  })

  test('should detect a regular yarn workspace from a package level', async ({ cwd }) => {
    const info = await getBuildInfo({ projectDir: 'packages/website', rootDir: cwd })
    expect(info.packageManager?.name).toBe('yarn')
    expect(info.jsWorkspaces?.isRoot).toBe(false)
    expect(info.jsWorkspaces?.packages).toEqual([
      { path: join('packages/blog'), name: '@evilcorp/blog' },
      { path: join('packages/website'), name: '@evilcorp/website' },
    ])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })

  test('should detect a regular yarn workspace from the root level', async ({ cwd }) => {
    const info = await getBuildInfo({ projectDir: cwd })
    expect(info.packageManager?.name).toBe('yarn')
    expect(info.jsWorkspaces?.isRoot).toBe(true)
    expect(info.jsWorkspaces?.packages).toEqual([
      { path: join('packages/blog'), name: '@evilcorp/blog' },
      { path: join('packages/website'), name: '@evilcorp/website' },
    ])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })
})

test('should detect a regular yarn project with a lock file in the root', async (ctx) => {
  const fixture = await createFixture('yarn-project', ctx)
  const info = await getBuildInfo({ projectDir: '', rootDir: fixture.cwd })
  expect(info.packageManager?.name).toBe('yarn')
})

test('should detect a regular yarn project that is nested in a sub-folder', async (ctx) => {
  const fixture = await createFixture('yarn-nested', ctx)
  const info = await getBuildInfo({ projectDir: `projects${sep}website`, rootDir: fixture.cwd })
  expect(info.packageManager?.name).toBe('yarn')
})
