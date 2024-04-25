import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detect a Quasar project', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@quasar/app': 'latest' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('quasar')
  expect(detected?.[0].name).toBe('Quasar')
  expect(detected?.[0].dev?.command).toBe('quasar dev -p 8081')
})

test('detect a Quasar v0.17 project', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { 'quasar-cli': '0.17.0' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('quasar')
  expect(detected?.[0].name).toBe('Quasar v0.17')
  expect(detected?.[0].dev?.command).toBe('quasar dev -p 8080')
})
