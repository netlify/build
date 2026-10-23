import { beforeEach, expect, test, vi } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a Hugo site from a config.toml', async ({ fs }) => {
  const cwd = mockFileSystem({
    'config.toml': `baseURL = 'https://example.org/'`,
    'content/_index.md': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  const hugo = detected?.find((framework) => framework.id === 'hugo')

  expect(hugo?.detected.configName).toBe('config.toml')
  expect(hugo?.build.command).toBe('hugo')
  expect(hugo?.build.directory).toBe('public')
})

test('detects a Hugo site from a hugo.yaml', async ({ fs }) => {
  const cwd = mockFileSystem({
    'hugo.yaml': `baseURL: https://example.org/`,
    'content/_index.md': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.length).toBe(1)
  expect(detected?.[0]?.id).toBe('hugo')
  expect(detected?.[0]?.detected.configName).toBe('hugo.yaml')
})

test('detects a Hugo site configured through a config/_default directory', async ({ fs }) => {
  const cwd = mockFileSystem({
    'config/_default/hugo.toml': `baseURL = 'https://example.org/'`,
    'config/_default/params.toml': '',
    'config/production/hugo.toml': '',
    'content/_index.md': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.length).toBe(1)
  expect(detected?.[0]?.id).toBe('hugo')
  expect(detected?.[0]?.detected.configName).toBe('hugo.toml')
  expect(detected?.[0]?.detected.config).toBe(fs.join(cwd, 'config', '_default', 'hugo.toml'))
})

test('detects a Hugo site whose config/_default directory only holds per-key files', async ({ fs }) => {
  const cwd = mockFileSystem({
    'config/_default/params.toml': '',
    'config/_default/menus.en.toml': '',
    'content/_index.md': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.length).toBe(1)
  expect(detected?.[0]?.id).toBe('hugo')
  expect(['params.toml', 'menus.en.toml']).toContain(detected?.[0]?.detected.configName)
})

test('detects a Hugo site configured through config/_default from a nested base directory', async ({ fs }) => {
  const cwd = mockFileSystem({
    'config/_default/config.yaml': `baseURL: https://example.org/`,
    'content/_index.md': '',
  })
  const detected = await new Project(fs, fs.join(cwd, 'content'), cwd).detectFrameworks()

  expect(detected?.length).toBe(1)
  expect(detected?.[0]?.id).toBe('hugo')
  expect(detected?.[0]?.detected.configName).toBe('config.yaml')
})

test('keeps walking up when the nearest config directory is not a Hugo one', async ({ fs }) => {
  const cwd = mockFileSystem({
    'config/_default/hugo.toml': `baseURL = 'https://example.org/'`,
    'site/config/settings.json': '{}',
    'site/content/_index.md': '',
  })
  const detected = await new Project(fs, fs.join(cwd, 'site'), cwd).detectFrameworks()

  expect(detected?.length).toBe(1)
  expect(detected?.[0]?.id).toBe('hugo')
  expect(detected?.[0]?.detected.config).toBe(fs.join(cwd, 'config', '_default', 'hugo.toml'))
})

test('does not detect Hugo from a config directory without a _default directory', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { next: '^14.0.0' } }),
    'config/database.yml': '',
    'config/_default': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.map((framework) => framework.id)).toEqual(['next'])
})

test('keeps the other frameworks when the config directory cannot be read', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { next: '^14.0.0' } }),
    'config/env.json': '{}',
  })
  const readDir = fs.readDir.bind(fs)
  vi.spyOn(fs, 'readDir').mockImplementation((async (path: string, withFileTypes?: true) => {
    if (path.endsWith('_default')) {
      throw new Error('Not Found')
    }
    return withFileTypes ? readDir(path, withFileTypes) : readDir(path)
  }) as typeof fs.readDir)
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.map((framework) => framework.id)).toEqual(['next'])
})
