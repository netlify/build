import { beforeEach, describe, expect, test, vi } from 'vitest'

import { NoopLogger } from '../node/get-build-info.js'
import { detectPackageManager } from '../package-managers/detect-package-manager.js'
import { Project } from '../project.js'
import { getWorkspacePackages } from '../workspaces/get-workspace-packages.js'

import { GithubProvider, WebFS } from './file-system.js'

// This is a mock for the github api functionality to have consistent tests and no rate limiting
global.fetch = vi.fn(async (url): Promise<any> => {
  switch (url) {
    case 'https://api.github.com/repos/netlify/build/contents/?ref=main':
      return new Response(
        JSON.stringify([
          { path: 'package.json', type: 'file' },
          { path: 'pnpm-lock.yaml', type: 'file' },
          { path: 'pnpm-workspace.yaml', type: 'file' },
          { path: 'packages', type: 'dir' },
          { path: 'tools', type: 'dir' },
          { path: 'nx.json', type: 'file' },
        ]),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
    case 'https://api.github.com/repos/netlify/build/contents/packages?ref=main':
      return new Response(
        JSON.stringify([
          { path: 'build-info', type: 'dir' },
          { path: 'build', type: 'dir' },
          { path: 'config', type: 'dir' },
          { path: 'other', type: 'dir' }, // not a package
        ]),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
    case 'https://api.github.com/repos/netlify/build/contents/packages/build-info?ref=main':
      return new Response(JSON.stringify([{ path: 'package.json', type: 'file' }]), {
        headers: { 'Content-Type': 'application/json' },
      })
    case 'https://api.github.com/repos/netlify/build/contents/packages/build-info/package.json?ref=main':
      return new Response(JSON.stringify({ name: '@netlify/build-info' }))
    case 'https://api.github.com/repos/netlify/build/contents/tools?ref=main':
      return new Response(JSON.stringify([{ path: 'package.json', type: 'file' }]), {
        headers: { 'Content-Type': 'application/json' },
      })
    case 'https://api.github.com/repos/netlify/build/contents/packages/config?ref=main':
      return new Response(JSON.stringify([{ path: 'package.json', type: 'file' }]), {
        headers: { 'Content-Type': 'application/json' },
      })
    case 'https://api.github.com/repos/netlify/build/contents/packages/build?ref=main':
      return new Response(JSON.stringify([{ path: 'package.json', type: 'file' }]), {
        headers: { 'Content-Type': 'application/json' },
      })
    case 'https://api.github.com/repos/netlify/build/contents/packages/build/package.json?ref=main':
      return new Response(JSON.stringify({ name: '@netlify/build' }))
    case 'https://api.github.com/repos/netlify/build/contents/package.json?ref=main':
      return new Response(JSON.stringify({ devDependencies: { nx: '^1.2.3' } }))
    case 'https://api.github.com/repos/netlify/build/contents/pnpm-workspace.yaml?ref=main':
      return new Response('packages:\n - packages/*\n - tools')
  }

  throw new Error(`404 ${url} not found!`)
})

describe('Test with a WebFS', () => {
  beforeEach((ctx) => {
    ctx.fs = new WebFS(new GithubProvider('netlify/build', 'main'))
    ctx.fs.logger = new NoopLogger()
  })

  test('should detect a build system from the base', async ({ fs }) => {
    const project = new Project(fs, '/')
    const tool = await project.detectBuildSystem()
    expect(tool[0].id).toBe('nx')
    expect(tool[0].version).toBe('^1.2.3')
  })

  test('should detect a build system with a baseDirectory by walking up the tree', async ({ fs }) => {
    const project = new Project(fs, 'packages/build-info')
    const tool = await project.detectBuildSystem()
    expect(tool[0].id).toBe('nx')
    expect(tool[0].version).toBe('^1.2.3')
  })

  test('should detect the package manager from the root', async ({ fs }) => {
    const project = new Project(fs, '/')
    expect(await detectPackageManager(project)).toMatchObject({ name: 'pnpm', installCommand: 'pnpm install' })
  })

  test('should detect the package manager with a base directory set', async ({ fs }) => {
    const project = new Project(fs, '/packages/build-info', '/')
    expect(await detectPackageManager(project)).toMatchObject({ name: 'pnpm', installCommand: 'pnpm install' })
  })

  test('should get a list of all workspace packages', async ({ fs }) => {
    expect(
      await getWorkspacePackages(new Project(fs, '/'), ['tools', 'packages/*', '!packages/build-info']),
    ).toMatchObject([
      { path: 'tools', name: undefined },
      { path: 'packages/build', name: '@netlify/build' },
      { path: 'packages/config', name: undefined },
    ])
  })

  test('should analyze workspace information from a nested subpackage', async ({ fs }) => {
    const project = new Project(fs, 'packages/build')
    await project.detectWorkspaces()

    expect(project.workspace).toEqual({
      isRoot: false,
      packages: [
        { path: 'packages/build-info', name: '@netlify/build-info' },
        { path: 'packages/build', name: '@netlify/build' },
        { path: 'packages/config', name: undefined },
        { path: 'tools', name: undefined },
      ],
      rootDir: '/',
    })
  })
})
