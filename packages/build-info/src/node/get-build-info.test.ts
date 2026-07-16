import { platform } from 'os'
import { join } from 'path'

import { afterEach, describe, expect, test } from 'vitest'

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
      "langRuntimes": [],
      "packageManager": null,
      "settings": [],
    }
  `)
})

test('should only detect go in a simple golang project', async () => {
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
      "langRuntimes": [
        {
          "id": "go",
          "name": "Go",
        },
      ],
      "packageManager": null,
      "settings": [],
    }
  `)
})

test('should not crash on invalid projects', async (ctx) => {
  const fixture = await createFixture('invalid-project', ctx)
  const { frameworks, packageManager } = await getBuildInfo({ projectDir: fixture.cwd })
  expect(packageManager).toMatchInlineSnapshot(`
    {
      "installCommand": "npm install",
      "localPackageCommand": "npx",
      "lockFiles": [
        "package-lock.json",
      ],
      "name": "npm",
      "remotePackageCommand": [
        "npx",
      ],
      "runCommand": "npm run",
    }
  `)
  expect(frameworks).toEqual([])
})

test.skipIf(platform() === 'win32')('should retrieve the build info for providing a rootDir', async (ctx) => {
  const fixture = await createFixture('pnpm-workspace', ctx)
  const info = await getBuildInfo({ rootDir: fixture.cwd })

  info.jsWorkspaces!.rootDir = '/cleaned-for-snapshot'
  info.settings = info.settings.sort((a, b) => (a.dist < b.dist ? -1 : 1))
  expect(info).toMatchSnapshot()
})

test.skipIf(platform() === 'win32')(
  'should retrieve the build info for providing a rootDir and the same projectDir',
  async (ctx) => {
    const fixture = await createFixture('pnpm-workspace', ctx)
    const info = await getBuildInfo({ rootDir: fixture.cwd, projectDir: fixture.cwd })

    info.jsWorkspaces!.rootDir = '/cleaned-for-snapshot'
    info.settings = info.settings.sort((a, b) => (a.dist < b.dist ? -1 : 1))
    expect(info).toMatchSnapshot()
  },
)

test.skipIf(platform() === 'win32')(
  'should retrieve the build info for providing a rootDir and a nested projectDir',
  async (ctx) => {
    const fixture = await createFixture('pnpm-workspace', ctx)
    const info = await getBuildInfo({ rootDir: fixture.cwd, projectDir: join(fixture.cwd, 'packages/blog') })

    info.jsWorkspaces!.rootDir = '/cleaned-for-snapshot'
    info.settings = info.settings.sort((a, b) => (a.dist < b.dist ? -1 : 1))
    expect(info).toMatchSnapshot()
  },
)

describe('Golang', () => {
  test('should only detect Go inside a golang workspace', async (ctx) => {
    const fixture = await createFixture('go-workspace', ctx)
    const info = await getBuildInfo({ projectDir: 'bar', rootDir: fixture.cwd })
    expect(info).toMatchInlineSnapshot(`
      {
        "buildSystems": [],
        "frameworks": [],
        "jsWorkspaces": null,
        "langRuntimes": [
          {
            "id": "go",
            "name": "Go",
          },
        ],
        "packageManager": null,
        "settings": [],
      }
    `)
  })
})

describe('JavaScript Workspaces', () => {
  test('project without package.json does not return workspaces info', async (ctx) => {
    const fixture = await createFixture('empty', ctx)
    const { jsWorkspaces } = await getBuildInfo({ projectDir: fixture.cwd })

    expect(jsWorkspaces).toBeNull()
  })

  test('project without workspaces in package.json does not return workspaces info', async (ctx) => {
    const fixture = await createFixture('simple-package-json', ctx)
    const { jsWorkspaces } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(jsWorkspaces).toBeNull()
  })

  test('projectDir set to workspaces root returns workspace info and isRoot flag set to true', async (ctx) => {
    const fixture = await createFixture('js-workspaces', ctx)
    const { jsWorkspaces } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(jsWorkspaces).not.toBeNull()
    expect(jsWorkspaces?.isRoot).toBe(true)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('projectDir set to workspace dir returns workspace info and isRoot flag set to false', async (ctx) => {
    const fixture = await createFixture('js-workspaces', ctx)
    const { jsWorkspaces } = await getBuildInfo({ projectDir: 'packages/gatsby-site', rootDir: fixture.cwd })
    expect(jsWorkspaces).not.toBeNull()
    expect(jsWorkspaces?.isRoot).toBe(false)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('if project is not part of a workspace return no workspace info', async (ctx) => {
    const fixture = await createFixture('js-workspaces', ctx)
    const { jsWorkspaces } = await getBuildInfo({ projectDir: 'not-in-workspace', rootDir: fixture.cwd })
    expect(jsWorkspaces).toBeNull()
  })

  test('handles absolute paths correctly', async (ctx) => {
    const fixture = await createFixture('js-workspaces', ctx)
    const { jsWorkspaces } = await getBuildInfo({
      projectDir: `${fixture.cwd}/packages/gatsby-site`,
      rootDir: fixture.cwd,
    })
    expect(jsWorkspaces).not.toBeNull()
    expect(jsWorkspaces?.isRoot).toBe(false)
    expect(jsWorkspaces?.packages.length).toBe(2)
  })

  test('detects workspaces and frameworks when given a rootDir and an empty projectDir', async (ctx) => {
    const fixture = await createFixture('js-workspaces', ctx)
    const { frameworks, jsWorkspaces } = await getBuildInfo({ projectDir: '', rootDir: fixture.cwd })
    expect(jsWorkspaces).not.toBeNull()
    expect(frameworks.length).toBe(1)
  })

  test('should detect workspaces and frameworks', async (ctx) => {
    const fixture = await createFixture('js-workspaces', ctx)
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
    const fixture = await createFixture('empty', ctx)
    const { frameworks } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(frameworks).toEqual([])
  })

  test('framework detection works correctly for npm pkg detected framework', async (ctx) => {
    const fixture = await createFixture('next-project', ctx)
    const { frameworks } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(frameworks).toHaveLength(1)
    expect(frameworks).toEqual([expect.objectContaining({ id: 'next' })])
  })

  test('framework detection works correctly for static file detected framework', async (ctx) => {
    const fixture = await createFixture('jekyll-project', ctx)
    const { frameworks } = await getBuildInfo({ projectDir: fixture.cwd })
    expect(frameworks).toHaveLength(1)
    expect(frameworks).toEqual([expect.objectContaining({ id: 'jekyll' })])
  })
})
