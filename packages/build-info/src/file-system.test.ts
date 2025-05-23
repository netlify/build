import { join, relative, posix } from 'path'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { GithubProvider, WebFS } from './browser/file-system.js'
import { detectPackageManager } from './package-managers/detect-package-manager.js'
import { Project } from './project.js'

const { join: posixJoin } = posix
// This is a mock for the github api functionality to have consistent tests and no rate limiting
global.fetch = vi.fn(async (url): Promise<any> => {
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
    case 'https://api.github.com/repos/netlify/build/contents/nx.json?ref=main':
      return new Response(JSON.stringify({}))
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
    const project = new Project(fs, '/packages/build-info')
    expect(await detectPackageManager(project)).toMatchObject({ name: 'pnpm', installCommand: 'pnpm install' })
  })
})

describe.concurrent('Test the platform independent base functionality', () => {
  beforeEach((ctx) => {
    ctx.fs = new WebFS(new GithubProvider('netlify/build', 'main'))
  })

  test('join should join path segments and always replace to posix style', ({ fs }) => {
    // test that the fs.join behaves exactly like the official node/posix join functionality
    ;[fs.join, posixJoin].forEach((joinFn) => {
      expect(joinFn('/', 'package.json')).toBe('/package.json')
      expect(joinFn('/', '', 'package.json')).toBe('/package.json')
      expect(joinFn('/', '..', 'package.json')).toBe('/package.json')
      expect(joinFn('..', 'package.json')).toBe('../package.json')
      expect(joinFn('', 'package.json')).toBe('package.json')
      expect(joinFn('', '', '', 'package.json')).toBe('package.json')
      expect(joinFn('a', 'b', 'c')).toBe('a/b/c')
      expect(joinFn('a', 'b/cd', 'e')).toBe('a/b/cd/e')
      expect(joinFn('a')).toBe('a')
      expect(joinFn('a/../b')).toBe('b')
      expect(joinFn('a/../b', 'cd')).toBe('b/cd')
    })
  })

  test('join should replace backslashes to forward slashes', ({ fs }) => {
    expect(fs.join('a\\b')).toBe('a/b')
    expect(fs.join('/foo', 'bar', 'baz\\asdf', 'quux', '..')).toBe('/foo/bar/baz/asdf')
    expect(fs.join('a\\b', 'other_ space')).toBe('a/b/other_ space')
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

  test('relative should return the relative path between two paths', ({ fs }) => {
    // always do a double test of the real path.relative and the independent implementation
    // The own implementation does not need a `join` as it's done in a webFS and therefore on windows it's still unix paths
    // whereas the comparison (baseline from relative) needs the join to match on windows as well
    fs.cwd = '/'
    vi.spyOn(process, 'cwd').mockImplementation(() => '/')
    expect(fs.relative('/a/b/c', '/a/b/c/d/e')).toBe('d/e')
    expect(relative('/a/b/c', '/a/b/c/d/e')).toBe(join('d/e'))

    fs.cwd = '/x'
    vi.spyOn(process, 'cwd').mockImplementation(() => '/x')

    expect(fs.relative('y', '/x/y/z')).toBe('z')
    expect(relative('y', '/x/y/z')).toBe('z')
    expect(fs.relative('/', '/a/b')).toBe('a/b')
    expect(relative('/', '/a/b')).toBe(join('a/b'))
    expect(fs.relative('/a/b/c', '/a/b/c/d/e')).toBe('d/e')
    expect(relative('/a/b/c', '/a/b/c/d/e')).toBe(join('d/e'))
    expect(fs.relative('/a/b/c/d/e', '/a/b/c')).toBe('../..')
    expect(relative('/a/b/c/d/e', '/a/b/c')).toBe(join('../..'))

    fs.cwd = '/a/b'
    vi.spyOn(process, 'cwd').mockImplementation(() => '/a/b')
    expect(fs.relative('c', 'e')).toBe('../e')
    expect(relative('c', 'e')).toBe(join('../e'))
    expect(fs.relative('a.txt', 'b.txt')).toBe('../b.txt')
    expect(relative('a.txt', 'b.txt')).toBe(join('../b.txt'))
    expect(fs.relative('', '')).toBe('')
    expect(relative('', '')).toBe('')
    expect(fs.relative('apps/web', 'apps/index.html')).toBe('../index.html')
    expect(relative('apps/web', 'apps/index.html')).toBe(join('../index.html'))
    expect(fs.relative('apps/a/b/c/d', 'apps/index.html')).toBe('../../../../index.html')
    expect(relative('apps/a/b/c/d', 'apps/index.html')).toBe(join('../../../../index.html'))
    expect(fs.relative('d', '/a/b/c')).toBe('../c')
    expect(relative('d', '/a/b/c')).toBe(join('../c'))
    expect(fs.relative('c', '/a/b/c')).toBe('')
    expect(relative('c', '/a/b/c')).toBe('')
    expect(fs.relative('c/d', '/a/b/c')).toBe('..')
    expect(relative('c/d', '/a/b/c')).toBe('..')
  })
})

describe.concurrent('Test findUp functionality', () => {
  beforeEach((ctx) => {
    ctx.fs = new WebFS(new GithubProvider('netlify/build', 'main'))
  })

  test('findUp', async ({ fs }) => {
    expect(await fs.findUp('package.json', { cwd: 'packages/build-info' })).toBe('/packages/build-info/package.json')
    expect(await fs.findUp('package.json', { cwd: '/packages/build-info' })).toBe('/packages/build-info/package.json')
    expect(await fs.findUp('package.json', { cwd: 'packages' })).toBe('/package.json')
    expect(await fs.findUp('package.json', { cwd: '/packages' })).toBe('/package.json')
    expect(await fs.findUp('package.json', { cwd: '/' })).toBe('/package.json')
    expect(await fs.findUp('build-info', { cwd: '/packages', type: 'directory' })).toBe('/packages/build-info')
    expect(await fs.findUp('nx.json', { cwd: 'packages/build-info' })).toBe('/nx.json')
    // should not find a file as we have the stopAt parameter
    expect(await fs.findUp('nx.json', { cwd: 'packages/build-info', stopAt: 'packages' })).toBeUndefined()
    expect(await fs.findUp('nx.json', { cwd: 'packages/build-info', stopAt: '/packages' })).toBeUndefined()
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
    expect(await fs.findUpMultiple('nx.json', { cwd: 'packages/build-info' })).toHaveLength(1)
    expect(await fs.findUpMultiple('nx.json', { cwd: 'packages/build-info' })).toMatchObject(['/nx.json'])
    // should not find a file as we have the stopAt parameter
    expect(await fs.findUpMultiple('nx.json', { cwd: 'packages/build-info', stopAt: 'packages' })).toHaveLength(0)
    expect(await fs.findUpMultiple('nx.json', { cwd: 'packages/build-info', stopAt: '/packages' })).toHaveLength(0)
  })
})
