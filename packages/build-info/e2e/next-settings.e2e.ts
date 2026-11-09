import { expect, test } from '@playwright/test'

import type { FileSystem } from '../src/file-system.js'
import type { Project } from '../src/project.js'

declare const window: Window & { fs: FileSystem; project: typeof Project }

test.beforeEach(async ({ page }) => {
  // the fallback keeps detection off the network; later routes take precedence in Playwright
  await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 404, json: {} }))
  await page.route('https://api.github.com/repos/netlify/build/contents/', (route) =>
    route.fulfill({ json: [{ path: 'package.json', type: 'file' }] }),
  )
  await page.route('https://api.github.com/repos/netlify/build/contents/package.json', (route) =>
    route.fulfill({
      body: JSON.stringify({
        name: 'next-site',
        dependencies: { next: '^15.0.0' },
        scripts: { build: 'next build', dev: 'next dev' },
      }),
    }),
  )
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
