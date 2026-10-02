import { posix } from 'path'

import { describe, expect, test } from 'vitest'

import { Project } from '../project.js'

import { GithubProvider, WebFS } from './file-system.js'

describe('WebFS.resolve', () => {
  test.each([
    [[]],
    [['']],
    [['apps', 'web']],
    [['/repo', '/repo/app']],
    [['/repo', '/other', 'app']],
    [['/repo/app', '/', 'other']],
    [['ignored', '/repo', '../app']],
    [['..', 'app']],
    [['/repo/app/']],
    [['app/']],
    [['/../../app']],
    [['/']],
  ])('resolves %j like posix.resolve does', (paths) => {
    const fs = new WebFS(new GithubProvider('netlify/build'))
    fs.cwd = '/repo'
    expect(fs.resolve(...paths)).toBe(posix.resolve(fs.cwd, ...paths))
  })

  test('keeps absolute project paths inside an explicit repository root', () => {
    const fs = new WebFS(new GithubProvider('netlify/build'))
    fs.cwd = '/repo'
    const project = new Project(fs, '/repo/app', '/repo')
    expect(project.baseDirectory).toBe('/repo/app')
    expect(project.root).toBe('/repo')
    expect(project.relativeBaseDirectory).toBe('app')
    expect(fs.cwd).toBe('/repo/app')
  })
})
