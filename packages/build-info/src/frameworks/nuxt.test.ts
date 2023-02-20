import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detect a nuxt v2 project', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { nuxt: 'latest' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected[0].id).toBe('nuxt')
  expect(detected[0].name).toBe('Nuxt')
  expect(detected[0].build.command).toBe('nuxt generate')
  expect(detected[0].dev?.command).toBe('nuxt')
})

test('detect a nuxt v2 project with edge dependency', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { 'nuxt-edge': 'latest' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected[0].id).toBe('nuxt')
  expect(detected[0].name).toBe('Nuxt')
  expect(detected[0].build.command).toBe('nuxt generate')
  expect(detected[0].dev?.command).toBe('nuxt')
})

test('detect a nuxt3 project', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { nuxt3: 'latest' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected[0].id).toBe('nuxt')
  expect(detected[0].name).toBe('Nuxt 3')
  expect(detected[0].build.command).toBe('npm run build')
  expect(detected[0].dev?.command).toBe('npm run dev')
})

test('should detect the nuxt 3 framework through the major version', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { nuxt: '^3.0.0' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected[0].id).toBe('nuxt')
  expect(detected[0].name).toBe('Nuxt 3')
  expect(detected[0].build.command).toBe('npm run build')
  expect(detected[0].dev?.command).toBe('npm run dev')
})

test('nuxt3 should be package manager aware for yarn', async ({ fs }) => {
  const cwd = mockFileSystem({
    'yarn.lock': '',
    'package.json': JSON.stringify({ dependencies: { nuxt3: 'latest' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected[0].id).toBe('nuxt')
  expect(detected[0].name).toBe('Nuxt 3')
  expect(detected[0].build.command).toBe('yarn build')
  expect(detected[0].dev?.command).toBe('yarn dev')
})

test('nuxt3 should be package manager aware for pnpm', async ({ fs }) => {
  const cwd = mockFileSystem({
    'pnpm-lock.yaml': '',
    'package.json': JSON.stringify({ dependencies: { nuxt3: 'latest' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected[0].id).toBe('nuxt')
  expect(detected[0].name).toBe('Nuxt 3')
  expect(detected[0].build.command).toBe('pnpm run build')
  expect(detected[0].dev?.command).toBe('pnpm run dev')
})
