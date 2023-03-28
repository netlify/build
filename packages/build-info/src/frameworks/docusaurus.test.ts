import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detect a docusarus v1 project based on the config file', async ({ fs }) => {
  const cwd = mockFileSystem({
    'siteConfig.js': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('docusaurus')
  expect(detected?.[0].build.command).toBe('docusaurus-build')
  expect(detected?.[0].dev?.command).toBe('docusaurus-start')
})

test('detect a docusarus v1 project based on the package.json', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { docusaurus: '^1.0.0' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('docusaurus')
  expect(detected?.[0].build.command).toBe('docusaurus-build')
  expect(detected?.[0].dev?.command).toBe('docusaurus-start')
})

test('detect a docusarus v2 project based on the config file', async ({ fs }) => {
  const cwd = mockFileSystem({
    'docusaurus.config.js': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('docusaurus')
  expect(detected?.[0].build.command).toBe('docusaurus build')
  expect(detected?.[0].build.directory).toBe('build')
  expect(detected?.[0].dev?.command).toBe('docusaurus start')
})

test('detect a docusarus v2 project based on the package.json', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@docusaurus/core': '~2.0.0' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('docusaurus')
  expect(detected?.[0].build.command).toBe('docusaurus build')
  expect(detected?.[0].build.directory).toBe('build')
  expect(detected?.[0].dev?.command).toBe('docusaurus start')
})
