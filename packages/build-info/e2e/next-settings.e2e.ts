import { expect, test } from '@playwright/test'

import type { FileSystem } from '../src/file-system.js'
import type { Project } from '../src/project.js'

declare const window: Window & { fs: FileSystem; project: typeof Project }

test.beforeEach(async ({ page }) => {
  await page.route('https://api.github.com/**', (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/repos/netlify/build/contents/') {
      return route.fulfill({ json: [{ path: 'package.json', type: 'file' }] })
    }
    if (path === '/repos/netlify/build/contents/package.json') {
      return route.fulfill({
        body: JSON.stringify({
          name: 'next-site',
          dependencies: { next: '^15.0.0' },
          scripts: { build: 'next build', dev: 'next dev' },
        }),
      })
    }
    return route.fulfill({ status: 404, json: { message: 'Not Found' } })
  })
  await page.goto('http://localhost:3000/')
})

for (const skip of [undefined, '', 'true']) {
  test(`detects Next.js build settings with NETLIFY_NEXT_PLUGIN_SKIP=${String(skip)}`, async ({ page }) => {
    const result = await page.evaluate(async (skip) => {
      const project = new window.project(window.fs, '/')
        .setNodeVersion('22')
        .setEnvironment({ NETLIFY_NEXT_PLUGIN_SKIP: skip })
      return { processType: typeof globalThis.process, settings: await project.getBuildSettings() }
    }, skip)
    expect(result.processType).toBe('undefined')
    expect(result.settings).toEqual([
      expect.objectContaining({
        framework: { id: 'next', name: 'Next.js' },
        buildCommand: 'npm run build',
        dist: '.next',
        plugins_recommended: skip ? [] : ['@netlify/plugin-nextjs'],
      }),
    ])
  })
}

test('resolves absolute project paths in the browser', async ({ page }) => {
  expect(
    await page.evaluate(() => {
      window.fs.cwd = '/repo'
      const project = new window.project(window.fs, '/repo/app', '/repo')
      return { base: project.baseDirectory, root: project.root, relativeBase: project.relativeBaseDirectory }
    }),
  ).toEqual({ base: '/repo/app', root: '/repo', relativeBase: 'app' })
})
