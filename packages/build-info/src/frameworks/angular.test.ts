import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should detect Angular', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@angular/cli': '17.0.0' } }),
    'angular.json': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('angular')
  expect(detected?.[0].name).toBe('Angular')
  expect(detected?.[0].build.command).toBe('ng build --prod')
  expect(detected?.[0].build.directory).toBe('dist/')
  expect(detected?.[0].dev?.command).toBe('ng serve')
  expect(detected?.[0].plugins).toBe(['@netlify/angular-runtime'])
})
