import { afterEach, describe, expect, test } from 'vitest'

import { getBuildInfo } from '../src/get-build-info.js'

import { createFixture } from './helpers.js'
// run tests inside temp directory to avoid side effects
let cleanup: () => Promise<void>

afterEach(async () => await cleanup())

test('should not crash on invalid projects', async () => {
  const fixture = await createFixture('invalid-project')
  cleanup = fixture.cleanup
  const { frameworks, packageManager } = await getBuildInfo({
    projectDir: fixture.cwd,
  })
  expect(packageManager).toMatchInlineSnapshot
  expect(frameworks).toEqual([])
})

describe('Golang', () => {
  test('should not detect anything inside a golang workspace', async () => {
    const fixture = await createFixture('go-workspace')
    cleanup = fixture.cleanup

    const info = await getBuildInfo({
      rootDir: fixture.cwd,
      projectDir: 'bar',
    })
    expect(info).toMatchInlineSnapshot(`
      {
        "frameworks": [],
      }
    `)
  })
})

describe('JavaScript Workspaces', () => {
  test('js-workspaces: project without package.json does not return workspaces info', async () => {
    const fixture = await createFixture('empty')
    cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({
      projectDir: fixture.cwd,
    })

    expect(jsWorkspaces).toBe(undefined)
  })

  test('js-workspaces: project without workspaces in package.json does not return workspaces info', async () => {
    const fixture = await createFixture('simple-package-json')
    cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({
      projectDir: fixture.cwd,
    })
    expect(jsWorkspaces).toBe(undefined)
  })

  test('js-workspaces: projectDir set to workspaces root returns workspace info and isRoot flag set to true', async () => {
    const fixture = await createFixture('js-workspaces')
    cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({
      projectDir: fixture.cwd,
    })
    expect(jsWorkspaces).not.toBe(undefined)
    expect(jsWorkspaces?.isRoot).toBe(true)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('js-workspaces: projectDir set to workspace dir returns workspace info and isRoot flag set to false', async () => {
    const fixture = await createFixture('js-workspaces')
    cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({
      rootDir: fixture.cwd,
      projectDir: 'packages/gatsby-site',
    })
    expect(jsWorkspaces).not.toBe(undefined)
    expect(jsWorkspaces?.isRoot).toBe(false)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('js-workspaces: if project is not part of a workspace return no workspace info', async () => {
    const fixture = await createFixture('js-workspaces')
    cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({
      rootDir: fixture.cwd,
      projectDir: 'not-in-workspace',
    })
    expect(jsWorkspaces).toBe(undefined)
  })

  test('js-workspaces: handles absolute paths correctly', async () => {
    const fixture = await createFixture('js-workspaces')
    cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({
      rootDir: fixture.cwd,
      projectDir: `${fixture.cwd}/packages/gatsby-site`,
    })
    expect(jsWorkspaces).not.toBe(undefined)
    expect(jsWorkspaces?.isRoot).toBe(false)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('detects workspaces and frameworks when given a rootDir and an empty projectDir', async () => {
    const fixture = await createFixture('js-workspaces')
    cleanup = fixture.cleanup

    const { frameworks, jsWorkspaces } = await getBuildInfo({
      rootDir: fixture.cwd,
      projectDir: '',
    })
    expect(jsWorkspaces).not.toBe(undefined)
    expect(frameworks.length).toBe(1)
  })

  test('should detect workspaces and frameworks', async () => {
    const fixture = await createFixture('js-workspaces')
    cleanup = fixture.cleanup

    const { frameworks, jsWorkspaces } = await getBuildInfo({
      rootDir: fixture.cwd,
      projectDir: 'packages/gatsby-site',
    })
    expect(jsWorkspaces).not.toBe(undefined)
    expect(frameworks.length).toBe(1)
  })
})

describe('Frameworks', () => {
  test('return an empty array if no frameworks are detected', async () => {
    const fixture = await createFixture('empty')
    cleanup = fixture.cleanup
    const { frameworks } = await getBuildInfo({
      projectDir: fixture.cwd,
    })
    expect(frameworks).toEqual([])
  })

  test('framework detection works correctly for npm pkg detected framework', async () => {
    const fixture = await createFixture('next-project')
    cleanup = fixture.cleanup
    const { frameworks } = await getBuildInfo({
      projectDir: fixture.cwd,
    })
    expect(frameworks).toHaveLength(1)
    expect(frameworks).toEqual([expect.objectContaining({ id: 'next' })])
  })

  test('framework detection works correctly for static file detected framework', async () => {
    const fixture = await createFixture('jekyll-project')
    cleanup = fixture.cleanup
    const { frameworks } = await getBuildInfo({
      projectDir: fixture.cwd,
    })
    expect(frameworks).toHaveLength(1)
    expect(frameworks).toEqual([expect.objectContaining({ id: 'jekyll' })])
  })
})
