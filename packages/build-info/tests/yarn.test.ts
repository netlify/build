import { sep } from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { getBuildInfo } from '../src/get-build-info.js'

import { createFixture } from './helpers.js'

let cwd: string
let cleanup: () => Promise<void>

afterEach(async () => await cleanup())

describe('Yarn Workspaces with yarn berry', () => {
  beforeEach(async () => {
    const fixture = await createFixture('yarn-berry-workspace')
    cwd = fixture.cwd
    cleanup = fixture.cleanup
  })

  test('should detect a regular yarn workspace from a package level', async () => {
    const info = await getBuildInfo({ projectDir: 'packages/website', rootDir: cwd })
    expect(info.packageManager?.name).toBe('yarn')
    expect(info.jsWorkspaces?.isRoot).toBe(false)
    expect(info.jsWorkspaces?.packages).toEqual([`packages${sep}blog`, `packages${sep}website`])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })

  test('should detect a regular yarn workspace from the root level', async () => {
    const info = await getBuildInfo({ projectDir: cwd })
    expect(info.packageManager?.name).toBe('yarn')
    expect(info.jsWorkspaces?.isRoot).toBe(true)
    expect(info.jsWorkspaces?.packages).toEqual([`packages${sep}blog`, `packages${sep}website`])
    expect(info.jsWorkspaces?.rootDir).toBe(cwd)
  })
})

test('should detect a regular yarn project with a lock file in the root', async () => {
  const fixture = await createFixture('yarn-project')
  cwd = fixture.cwd
  cleanup = fixture.cleanup

  const info = await getBuildInfo({ projectDir: '', rootDir: cwd })
  expect(info.packageManager?.name).toBe('yarn')
})

test('should detect a regular yarn project that is nested in a sub-folder', async () => {
  const fixture = await createFixture('yarn-nested')
  cwd = fixture.cwd
  cleanup = fixture.cleanup

  const info = await getBuildInfo({ projectDir: `projects${sep}website`, rootDir: cwd })
  expect(info.packageManager?.name).toBe('yarn')
})
