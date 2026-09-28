import { beforeEach, describe, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

describe('vite', () => {
  test('detects a vite project', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { vite: '^7.0.0' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()

    expect(detected?.[0].id).toBe('vite')
    expect(detected?.[0].build.command).toBe('vite build')
    expect(detected?.[0].build.directory).toBe('dist')
    expect(detected?.[0].dev?.command).toBe('vite')
  })

  test('uses the vp command surface for a vite-plus project', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { 'vite-plus': '^0.2.0' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()

    expect(detected?.[0].id).toBe('vite')
    expect(detected?.[0].build.command).toBe('vp build')
    expect(detected?.[0].build.directory).toBe('dist')
    expect(detected?.[0].dev?.command).toBe('vp dev')
  })

  test('prefers the vp command surface when both vite and vite-plus are present', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { vite: '^7.0.0', 'vite-plus': '^0.2.0' } }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()

    expect(detected?.[0].id).toBe('vite')
    expect(detected?.[0].build.command).toBe('vp build')
    expect(detected?.[0].dev?.command).toBe('vp dev')
  })

  test('is not detected when a vite-based meta-framework is present', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        devDependencies: { 'vite-plus': '^0.2.0', '@sveltejs/kit': '^2.0.0', svelte: '^5.0.0' },
      }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()

    expect(detected?.find(({ id }) => id === 'vite')).toBeUndefined()
  })
})
