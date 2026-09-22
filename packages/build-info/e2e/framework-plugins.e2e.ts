import { test, expect } from '@playwright/test'

import type { FileSystem } from '../src/file-system.js'
import type { Project } from '../src/project.js'

declare const window: Window & {
  fs: FileSystem
  project: typeof Project
}

const frameworks = [
  {
    id: 'angular',
    dependency: '@angular/cli',
    version: '17.0.0',
    skipVariable: 'NETLIFY_ANGULAR_PLUGIN_SKIP',
    plugin: '@netlify/angular-runtime',
    command: 'ng build --prod',
    directory: 'dist/demo/browser',
    skippedDirectory: 'dist/',
  },
  {
    id: 'gatsby',
    dependency: 'gatsby',
    version: '5.0.0',
    skipVariable: 'NETLIFY_SKIP_GATSBY_BUILD_PLUGIN',
    plugin: '@netlify/plugin-gatsby',
    command: 'gatsby build',
    directory: 'public',
    skippedDirectory: 'public',
  },
]

for (const framework of frameworks) {
  for (const skip of [undefined, '', 'true']) {
    test(`${framework.id} build settings with skip ${JSON.stringify(skip)}`, async ({ page }) => {
      await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 404, body: '' }))
      await page.route('https://api.github.com/repos/netlify/build/contents/', (route) =>
        route.fulfill({
          json: [
            { path: 'package.json', type: 'file' },
            ...(framework.id === 'angular' ? [{ path: 'angular.json', type: 'file' }] : []),
          ],
        }),
      )
      await page.route('https://api.github.com/repos/netlify/build/contents/package.json', (route) =>
        route.fulfill({
          contentType: 'text/plain',
          body: JSON.stringify({ dependencies: { [framework.dependency]: framework.version } }),
        }),
      )
      await page.route('https://api.github.com/repos/netlify/build/contents/angular.json', (route) =>
        route.fulfill({
          contentType: 'text/plain',
          body: JSON.stringify({
            projects: {
              demo: {
                architect: {
                  build: {
                    builder: '@angular-devkit/build-angular:application',
                    options: { outputPath: 'dist/demo' },
                  },
                },
              },
            },
          }),
        }),
      )
      await page.goto('http://localhost:3000/')
      const result = await page.evaluate(
        async ({ skipVariable, skip }) => ({
          processType: typeof process,
          settings: await new window.project(window.fs, '/')
            .setEnvironment({ NODE_VERSION: '22', [skipVariable]: skip })
            .getBuildSettings(),
        }),
        { skipVariable: framework.skipVariable, skip },
      )
      expect(result.processType).toBe('undefined')
      expect(result.settings).toMatchObject([
        {
          framework: { id: framework.id },
          buildCommand: framework.command,
          dist: skip ? framework.skippedDirectory : framework.directory,
          plugins_recommended: skip ? [] : [framework.plugin],
        },
      ])
    })
  }
}
