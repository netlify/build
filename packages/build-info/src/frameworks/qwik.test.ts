import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should detect qwik with npm', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@builder.io/qwik': '*' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('qwik')
  expect(detected?.[0].build.command).toBe('npm run build')
  expect(detected?.[0].build.directory).toBe('dist')
  expect(detected?.[0].dev?.command).toBe('vite dev')
})

test('should detect qwik with yarn', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ packageManager: 'yarn@3.2.1', dependencies: { '@builder.io/qwik': '*' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('qwik')
  expect(detected?.[0].build.command).toBe('yarn run build')
  expect(detected?.[0].build.directory).toBe('dist')
})

test('should detect qwik', async ({ fs }) => {
  const cwd = mockFileSystem({
    'pnpm-lock.yaml': '',
    'package.json': JSON.stringify({ dependencies: { '@builder.io/qwik': '*' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('qwik')
  expect(detected?.[0].name).toBe('Qwik')
  expect(detected?.[0].build.command).toBe('pnpm run build')
  expect(detected?.[0].build.directory).toBe('dist')
  expect(detected?.[0].dev?.command).toBe('vite dev')
})
