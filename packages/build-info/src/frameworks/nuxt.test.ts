import { beforeEach, expect, describe, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

let fs: NodeFS

beforeEach(() => {
  fs = new NodeFS()
})

describe('Nuxt V2', () => {
  test.each([
    ['dependency', { 'package.json': JSON.stringify({ dependencies: { nuxt: 'latest' } }) }],
    ['edge dependency', { 'package.json': JSON.stringify({ dependencies: { 'nuxt-edge': 'latest' } }) }],
  ])('should detect Nuxt via the %s', async (_, files) => {
    const cwd = mockFileSystem(files)
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('nuxt')
    expect(detected?.[0].name).toBe('Nuxt')
    expect(detected?.[0].build.command).toBe('nuxt generate')
    expect(detected?.[0].dev?.command).toBe('nuxt')
    expect(detected?.[0].dev?.port).toBe(3000)
    expect(detected?.[0].env).toEqual({})
  })
})

describe('Nuxt V3', () => {
  test.each([
    ['dependency', { 'package.json': JSON.stringify({ dependencies: { nuxt3: 'latest' } }) }],
    ['major version', { 'package.json': JSON.stringify({ dependencies: { nuxt: '^3.0.0' } }) }],
  ])('should detect Nuxt via the %s', async (_, files) => {
    const cwd = mockFileSystem(files)
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('nuxt')
    expect(detected?.[0].name).toBe('Nuxt 3')
    expect(detected?.[0].build.command).toBe('npm run build')
    expect(detected?.[0].dev?.command).toBe('npm run dev')
    expect(detected?.[0].dev?.port).toBe(3000)
    expect(detected?.[0].env).toMatchObject({
      AWS_LAMBDA_JS_RUNTIME: 'nodejs14.x',
      NODE_VERSION: '14',
    })
  })

  test('detect a nuxt3 project with yarn', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ packageManager: 'yarn@3.1.1', dependencies: { nuxt3: 'latest' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('nuxt')
    expect(detected?.[0].build.command).toBe('yarn run build')
    expect(detected?.[0].dev?.command).toBe('yarn run dev')
    expect(detected?.[0].dev?.port).toBe(3000)
  })

  test('nuxt3 should be package manager aware for yarn', async ({ fs }) => {
    const cwd = mockFileSystem({
      'yarn.lock': '',
      'package.json': JSON.stringify({ dependencies: { nuxt3: 'latest' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('nuxt')
    expect(detected?.[0].name).toBe('Nuxt 3')
    expect(detected?.[0].build.command).toBe('yarn run build')
    expect(detected?.[0].dev?.command).toBe('yarn run dev')
  })

  test('nuxt3 should be package manager aware for pnpm', async ({ fs }) => {
    const cwd = mockFileSystem({
      'pnpm-lock.yaml': '',
      'package.json': JSON.stringify({ dependencies: { nuxt3: 'latest' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('nuxt')
    expect(detected?.[0].name).toBe('Nuxt 3')
    expect(detected?.[0].build.command).toBe('pnpm run build')
    expect(detected?.[0].dev?.command).toBe('pnpm run dev')
  })
})
