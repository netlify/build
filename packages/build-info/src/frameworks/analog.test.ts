import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should detect analog', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@analogjs/platform': '*' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('analog')
  expect(detected?.[0].build.command).toBe('ng build --prod')
  expect(detected?.[0].build.directory).toBe('dist/analog/public')
  expect(detected?.[0].dev?.command).toBe('ng serve')
})

test('should not detect angular', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@analogjs/platform': '*', '@angular/cli': '*' } }),
    'angular.json': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('angular')
})
