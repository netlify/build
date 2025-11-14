import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

test('should detect Angular', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@angular/cli': '17.0.0' } }),
    'angular.json': JSON.stringify({
      projects: {
        demo: {
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:application',
              options: {
                outputPath: 'dist/demo',
              },
            },
          },
        },
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('angular')
  expect(detected?.[0].name).toBe('Angular')
  expect(detected?.[0].build.command).toBe('ng build --prod')
  expect(detected?.[0].build.directory).toBe(fs.join('dist', 'demo', 'browser'))
  expect(detected?.[0].dev?.command).toBe('ng serve')
  expect(detected?.[0].plugins).toEqual(['@netlify/angular-runtime'])
})

test('should set publish directory based on builder', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@angular/cli': '17.1.0-next.0' } }),
    'angular.json': JSON.stringify({
      projects: {
        demo: {
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:browser',
              options: {
                outputPath: 'dist/demo',
              },
            },
          },
        },
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].build.directory).toBe('dist/demo')
})

test('should only install plugin on v17+', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@angular/cli': '16.0.0' } }),
    'angular.json': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].build.directory).toBe('dist/')
  expect(detected?.[0].plugins).toEqual([])
})

test('should not install plugin when NETLIFY_ANGULAR_PLUGIN_SKIP is set', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@angular/cli': '17.0.0' } }),
    'angular.json': JSON.stringify({
      projects: {
        demo: {
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:application',
              options: {
                outputPath: 'dist/demo',
              },
            },
          },
        },
      },
    }),
  })
  vi.stubEnv('NETLIFY_ANGULAR_PLUGIN_SKIP', 'true')
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('angular')
  expect(detected?.[0].plugins).toHaveLength(0)
})
