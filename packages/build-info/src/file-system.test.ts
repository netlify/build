import { beforeEach, describe, expect, test, vi } from 'vitest'

import { GithubProvider, WebFS } from './browser/file-system.js'
import { detectPackageManager } from './package-managers/detect-package-manager.js'
import { Project } from './project.js'

// This is a mock for the github api functionality to have consistent tests and no rate limiting
global.fetch = vi.fn(async (url) => {
  switch (url) {
    case 'https://api.github.com/repos/netlify/build/contents/?ref=main':
      return new Response(
        JSON.stringify([
          { path: 'package.json', type: 'file' },
          { path: 'pnpm-lock.yaml', type: 'file' },
          { path: 'packages', type: 'dir' },
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
        ]),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
    case 'https://api.github.com/repos/netlify/build/contents/packages/build-info?ref=main':
      return new Response(JSON.stringify([{ path: 'package.json', type: 'file' }]), {
        headers: { 'Content-Type': 'application/json' },
      })
    case 'https://api.github.com/repos/netlify/build/contents/package.json?ref=main':
      return new Response(JSON.stringify({ devDependencies: { nx: '^1.2.3' } }))
    case 'https://api.github.com/repos/netlify/build/contents/packages/build-info/package.json?ref=main':
      return new Response(JSON.stringify({ name: '@netlify/build-info' }))
  }

  throw new Error(`404 ${url} not found!`)
})

describe.concurrent('Test with a WebFS', () => {
  beforeEach((ctx) => {
    ctx.fs = new WebFS(new GithubProvider('netlify/build', 'main'))
  })

  test('should detect a build system from the base', async ({ fs }) => {
    const project = new Project(fs, '/')
    const tool = await project.detectBuildSystem()
    expect(tool[0].id).toBe('nx')
    expect(tool[0].version).toBe('^1.2.3')
  })

  test('should detect a build system with a baseDirectory by walking up the tree', async ({ fs }) => {
    const project = new Project(fs, '/', 'packages/build-info')
    const tool = await project.detectBuildSystem()
    expect(tool[0].id).toBe('nx')
    expect(tool[0].version).toBe('^1.2.3')
  })

  test('should detect the package manager from the root', async ({ fs }) => {
    const project = new Project(fs, '/')
    expect(await detectPackageManager(project)).toMatchObject({ name: 'pnpm', installCommand: 'pnpm install' })
  })

  test('should detect the package manager with a base directory set', async ({ fs }) => {
    const project = new Project(fs, '/', 'packages/build-info')
    expect(await detectPackageManager(project)).toMatchObject({ name: 'pnpm', installCommand: 'pnpm install' })
  })
})

describe.concurrent('Test the platform independent base functionality', () => {
  beforeEach((ctx) => {
    ctx.fs = new WebFS(new GithubProvider('netlify/build', 'main'))
  })

  test('hasFile should check if the file exists', async ({ fs }) => {
    expect(fs.hasFile('path/to/my/file')).toBe(false)
    // just discover the file
    fs.files.set('path/to/my/file', null)
    expect(fs.hasFile('path/to/my/file')).toBe(false)

    fs.files.set('path/to/my/file', { content: 'hello', type: 'text' })
    expect(fs.hasFile('path/to/my/file')).toBe(true)
  })

  test('setFile should add a file to the fs', async ({ fs }) => {
    expect(fs.hasFile('path/to/my/file')).toBe(false)
    fs.setFile('path/to/my/file', { content: {}, type: 'json' })
    expect(fs.hasFile('path/to/my/file')).toBe(true)
  })

  test('join should join path segments and always replace to posix style', ({ fs }) => {
    expect(fs.join('a', 'b', 'c')).toBe('a/b/c')
    expect(fs.join('a', 'b/cd', 'e')).toBe('a/b/cd/e')
    expect(fs.join('a')).toBe('a')
    expect(fs.join('a\\b')).toBe('a/b')
    expect(fs.join('a\\b', 'other_ space')).toBe('a/b/other_ space')
    expect(fs.join('/foo', 'bar', 'baz\\asdf', 'quux', '..')).toBe('/foo/bar/baz/asdf')
    expect(fs.join('a/../b')).toBe('b')
    expect(fs.join('a/../b', 'cd')).toBe('b/cd')
  })

  test('basename should return the last path segment', ({ fs }) => {
    expect(fs.basename('some/path')).toBe('path')
    expect(fs.basename('some/longer/path/with/filename.txt')).toBe('filename.txt')
    expect(fs.basename('/absolute/path/filename.txt')).toBe('filename.txt')
    expect(fs.basename('\\absolute\\path\\filename.txt')).toBe('filename.txt')
    expect(fs.basename('filename.txt')).toBe('filename.txt')
    expect(fs.basename('/filename.txt')).toBe('filename.txt')
    expect(fs.basename('/')).toBe('')
  })

  test('dirname should return the directory of a filepath', ({ fs }) => {
    expect(fs.dirname('some/path')).toBe('some')
    expect(fs.dirname('some/longer/path/with/filename.txt')).toBe('some/longer/path/with')
    expect(fs.dirname('/absolute/path/filename.txt')).toBe('/absolute/path')
    expect(fs.dirname('\\absolute\\path\\filename.txt')).toBe('/absolute/path')
    expect(fs.dirname('filename.txt')).toBe('')
    expect(fs.dirname('/filename.txt')).toBe('/')
    expect(fs.dirname('/')).toBe('/')
  })
})

describe.concurrent('Test findUp functionality', () => {
  beforeEach((ctx) => {
    ctx.fs = new WebFS(new GithubProvider('netlify/build', 'main'))
  })

  test('findUp', async ({ fs }) => {
    expect(await fs.findUp('package.json', { cwd: 'packages/build-info' })).toBe('packages/build-info/package.json')
    expect(await fs.findUp('package.json', { cwd: '/packages/build-info' })).toBe('/packages/build-info/package.json')
    expect(await fs.findUp('package.json', { cwd: 'packages' })).toBe('package.json')
    expect(await fs.findUp('package.json', { cwd: '/packages' })).toBe('/package.json')
    expect(await fs.findUp('package.json', { cwd: '/' })).toBe('/package.json')
    expect(await fs.findUp('build-info', { cwd: '/packages', type: 'directory' })).toBe('/packages/build-info')
  })

  test('findUpMultiple', async ({ fs }) => {
    expect(await fs.findUpMultiple('package.json', { cwd: '/packages/build-info' })).toMatchObject([
      '/packages/build-info/package.json',
      '/package.json',
    ])
    expect(await fs.findUpMultiple(['package.json'], { cwd: '/packages/build-info' })).toMatchObject([
      '/packages/build-info/package.json',
      '/package.json',
    ])
    expect(await fs.findUpMultiple('package.json', { cwd: '/packages' })).toMatchObject(['/package.json'])
    expect(await fs.findUpMultiple('package.json', { cwd: '/' })).toMatchObject(['/package.json'])
    expect(await fs.findUpMultiple('build-info', { cwd: '/packages', type: 'directory' })).toMatchObject([
      '/packages/build-info',
    ])
  })
})
