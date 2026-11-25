import { beforeEach, describe, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

describe('nitro', () => {
  test('should detect a Nitro project', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { nitro: '^3.0.0' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.map((framework) => framework.id)).toEqual(['nitro'])
    expect(detected?.[0].build.command).toBe('nitro build')
    expect(detected?.[0].build.directory).toBe('dist')
    expect(detected?.[0].dev?.command).toBe('nitro dev')
    expect(detected?.[0].dev?.port).toBe(3000)
  })

  test('should detect Nitro when Vite is only its bundler (no Vite config)', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { nitro: '^3.0.0', vite: '^8.0.0' } }),
      'nitro.config.ts': 'export default {}',
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.map((framework) => framework.id)).toEqual(['nitro'])
  })

  test('should detect Vite when Nitro is used as a Vite plugin', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { nitro: '^3.0.0', vite: '^8.0.0' } }),
      'vite.config.ts': 'import { nitro } from "nitro/vite"; export default { plugins: [nitro()] }',
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.map((framework) => framework.id)).toEqual(['vite'])
    expect(detected?.[0].build.command).toBe('vite build')
  })

  test('should prefer Nitro over Hono', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ dependencies: { hono: '^4.0.0' }, devDependencies: { nitro: '^3.0.0' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('nitro')
  })

  test.for([
    ['nuxt', { nuxt: '^5.0.0', nitro: '^3.0.0' }],
    ['solid-start', { '@solidjs/start': '^2.0.0', nitro: '^3.0.0', vite: '^8.0.0' }],
    ['tanstack-start', { '@tanstack/react-start': '^1.140.0', nitro: '^3.0.0', vite: '^8.0.0' }],
    ['analog', { '@analogjs/platform': '^3.0.0', nitro: '^3.0.0', vite: '^8.0.0' }],
  ] as const)('should not detect Nitro in %s projects', async ([id, devDependencies], { fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies }),
      'vite.config.ts': 'export default {}',
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe(id)
    expect(detected?.map((framework) => framework.id)).not.toContain('nitro')
  })
})
