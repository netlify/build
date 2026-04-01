import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects Vite+ when vite-plus is in devDependencies', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { 'vite-plus': '^1.0.0' } }),
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Vite+')
  expect(detected[0]?.version).toBe('^1.0.0')
})

test('detects Vite+ when vite-plus is in dependencies', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { 'vite-plus': '^2.0.0' } }),
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Vite+')
  expect(detected[0]?.version).toBe('^2.0.0')
})

test('does not detect Vite+ when vite-plus is absent', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { vite: '^5.0.0' } }),
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected.find((b) => b.name === 'Vite+')).toBeUndefined()
})

test('generates vp run commands from package.json scripts', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      devDependencies: { 'vite-plus': '^1.0.0' },
      scripts: {
        build: 'vite build',
        dev: 'vite dev',
        test: 'vitest',
      },
    }),
  })
  const project = new Project(fs, cwd)
  const detected = await project.detectBuildSystem()
  const vitePlus = detected.find((b) => b.name === 'Vite+')

  const commands = await vitePlus!.getCommands!('')
  expect(commands).toEqual([
    { type: 'build', command: 'vp run build' },
    { type: 'dev', command: 'vp run dev' },
    { type: 'unknown', command: 'vp run test' },
  ])
})
