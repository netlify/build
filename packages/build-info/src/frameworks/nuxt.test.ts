import { beforeEach, expect, describe, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { getSettings } from '../index.js'
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
    const project = new Project(fs, cwd)
    const detected = await project.detectFrameworks()
    expect(detected?.[0].id).toBe('nuxt')
    expect(detected?.[0].name).toBe('Nuxt 3')
    expect(detected?.[0].build.command).toBe('nuxt build')
    expect(detected?.[0].build?.directory).toBe('dist')
    expect(detected?.[0].dev?.command).toBe('nuxt dev')
    expect(detected?.[0].dev?.clearPublishDirectory).toBe(true)
    expect(detected?.[0].dev?.port).toBe(3000)

    const settings = await getSettings(detected![0], project, cwd)
    expect(settings.clearPublishDirectory).toBeTruthy()
  })
})
