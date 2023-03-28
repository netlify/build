import { expect, test, afterEach, describe } from 'vitest'

import { createFixture } from '../../tests/helpers.js'
import { mockFileSystem } from '../../tests/mock-file-system.js'
import { getBuildInfo } from '../node/get-build-info.js'

afterEach(async ({ cleanup }) => await cleanup?.())

test('should detect nothing in an empty project', async () => {
  const cwd = mockFileSystem({})
  const info = await getBuildInfo({ projectDir: cwd })
  expect(info).toMatchInlineSnapshot(`
    {
      "buildSystems": [],
      "frameworks": [],
      "jsWorkspaces": null,
      "packageManager": null,
    }
  `)
})

test('should detect nothing in a simple golang project', async () => {
  const cwd = mockFileSystem({
    'go.mod': '',
    'main.go': '',
  })
  const info = await getBuildInfo({ projectDir: cwd })
  expect(info).toMatchInlineSnapshot(`
    {
      "buildSystems": [],
      "frameworks": [],
      "jsWorkspaces": null,
      "packageManager": null,
    }
  `)
})

test('should not crash on invalid projects', async (ctx) => {
  const fixture = await createFixture('invalid-project')
  ctx.cleanup = fixture.cleanup
  const { frameworks, packageManager } = await getBuildInfo({ projectDir: fixture.cwd })
  expect(packageManager).toMatchInlineSnapshot
  expect(frameworks).toEqual([])
})

describe('Golang', () => {
  test('should not detect anything inside a golang workspace', async (ctx) => {
    const fixture = await createFixture('go-workspace')
    ctx.cleanup = fixture.cleanup

    const info = await getBuildInfo({ projectDir: 'bar', rootDir: fixture.cwd })
    expect(info).toMatchInlineSnapshot(`
      {
        "buildSystems": [],
        "frameworks": [],
        "jsWorkspaces": null,
        "packageManager": null,
      }
    `)
  })
})

describe('JavaScript Workspaces', () => {
  test('project without package.json does not return workspaces info', async (ctx) => {
    const fixture = await createFixture('empty')
    ctx.cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({ projectDir: fixture.cwd })

    expect(jsWorkspaces).toBeNull()
  })

  test('project without workspaces in package.json does not return workspaces info', async (ctx) => {
    const fixture = await createFixture('simple-package-json')
    ctx.cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(jsWorkspaces).toBeNull()
  })

  test('projectDir set to workspaces root returns workspace info and isRoot flag set to true', async (ctx) => {
    const fixture = await createFixture('js-workspaces')
    ctx.cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(jsWorkspaces).not.toBeNull()
    expect(jsWorkspaces?.isRoot).toBe(true)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('projectDir set to workspace dir returns workspace info and isRoot flag set to false', async (ctx) => {
    const fixture = await createFixture('js-workspaces')
    ctx.cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({ projectDir: 'packages/gatsby-site', rootDir: fixture.cwd })
    expect(jsWorkspaces).not.toBeNull()
    expect(jsWorkspaces?.isRoot).toBe(false)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('if project is not part of a workspace return no workspace info', async (ctx) => {
    const fixture = await createFixture('js-workspaces')
    ctx.cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({ projectDir: 'not-in-workspace', rootDir: fixture.cwd })
    expect(jsWorkspaces).toBeNull()
  })

  test('handles absolute paths correctly', async (ctx) => {
    const fixture = await createFixture('js-workspaces')
    ctx.cleanup = fixture.cleanup
    const { jsWorkspaces } = await getBuildInfo({
      projectDir: `${fixture.cwd}/packages/gatsby-site`,
      rootDir: fixture.cwd,
    })
    expect(jsWorkspaces).not.toBeNull()
    expect(jsWorkspaces?.isRoot).toBe(false)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('detects workspaces and frameworks when given a rootDir and an empty projectDir', async (ctx) => {
    const fixture = await createFixture('js-workspaces')
    ctx.cleanup = fixture.cleanup

    const { frameworks, jsWorkspaces } = await getBuildInfo({ projectDir: '', rootDir: fixture.cwd })
    expect(jsWorkspaces).not.toBeNull()
    expect(frameworks.length).toBe(1)
  })

  test('should detect workspaces and frameworks', async (ctx) => {
    const fixture = await createFixture('js-workspaces')
    ctx.cleanup = fixture.cleanup

    const { frameworks, jsWorkspaces } = await getBuildInfo({
      projectDir: 'packages/gatsby-site',
      rootDir: fixture.cwd,
    })
    expect(jsWorkspaces).not.toBeNull()
    expect(frameworks.length).toBe(1)
  })
})

describe('Frameworks', () => {
  test('return an empty array if no frameworks are detected', async (ctx) => {
    const fixture = await createFixture('empty')
    ctx.cleanup = fixture.cleanup
    const { frameworks } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(frameworks).toEqual([])
  })

  test('framework detection works correctly for npm pkg detected framework', async (ctx) => {
    const fixture = await createFixture('next-project')
    ctx.cleanup = fixture.cleanup
    const { frameworks } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(frameworks).toHaveLength(1)
    expect(frameworks).toEqual([expect.objectContaining({ id: 'next' })])
  })

  test('framework detection works correctly for static file detected framework', async (ctx) => {
    const fixture = await createFixture('jekyll-project')
    ctx.cleanup = fixture.cleanup
    const { frameworks } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(frameworks).toHaveLength(1)
    expect(frameworks).toEqual([expect.objectContaining({ id: 'jekyll' })])
  })
})
