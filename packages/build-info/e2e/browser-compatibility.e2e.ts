import { test, expect } from '@playwright/test'

import type { FileSystem } from '../src/file-system.js'
import type { detectPackageManager } from '../src/package-managers/detect-package-manager.js'
import type { Project } from '../src/project.js'
import type { detectWorkspaces } from '../src/workspaces/detect-workspace.js'

declare const window: Window & {
  fs: FileSystem
  project: typeof Project
  detectPackageManager: typeof detectPackageManager
  detectWorkspace: typeof detectWorkspaces
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await Promise.all([
    page.route('https://api.github.com/repos/netlify/build/contents/', async (route) =>
      route.fulfill({
        json: [
          { path: 'package.json', type: 'file' },
          { path: 'pnpm-lock.yaml', type: 'file' },
          { path: 'pnpm-workspace.yaml', type: 'file' },
          { path: 'packages', type: 'dir' },
          { path: 'tools', type: 'dir' },
          { path: 'nx.json', type: 'file' },
        ],
      }),
    ),
    page.route('https://api.github.com/repos/netlify/build/contents/packages', async (route) =>
      route.fulfill({
        json: [
          { path: 'web', type: 'dir' },
          { path: 'docs', type: 'dir' },
        ],
      }),
    ),
    page.route('https://api.github.com/repos/netlify/build/contents/packages/web', async (route) =>
      route.fulfill({
        json: [{ path: 'package.json', type: 'file' }],
      }),
    ),
    page.route('https://api.github.com/repos/netlify/build/contents/packages/docs', async (route) =>
      route.fulfill({
        json: [{ path: 'package.json', type: 'file' }],
      }),
    ),
    page.route('https://api.github.com/repos/netlify/build/contents/package.json', async (route) =>
      route.fulfill({
        body: JSON.stringify({ devDependencies: { nx: '^1.2.3' } }),
      }),
    ),
    page.route('https://api.github.com/repos/netlify/build/contents/pnpm-workspace.yaml', async (route) =>
      route.fulfill({
        body: 'packages:\n- packages/*',
      }),
    ),
  ])
})

test('Should detect nx on the root', async ({ page }) => {
  await page.pause()
  expect(
    await page.evaluate(async () => {
      return new window.project(window.fs, '/').detectBuildSystem()
    }),
  ).toMatchObject([
    {
      id: 'nx',
      name: 'Nx',
      version: '^1.2.3',
    },
    { id: 'pnpm' },
  ])
})

test('Should detect the package manager', async ({ page }) => {
  expect(await page.evaluate(() => window.detectPackageManager(new window.project(window.fs, '/')))).toMatchObject({
    forceEnvironment: 'NETLIFY_USE_PNPM',
    installCommand: 'pnpm install',
    lockFiles: ['pnpm-lock.yaml'],
    name: 'pnpm',
  })
})

test('Should detect js workspaces', async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const project = new window.project(window.fs, '/')
      await project.detectPackageManager()
      return project.detectWorkspaces()
    }),
  ).toMatchObject({
    isRoot: true,
    rootDir: '/',
    packages: [
      { path: 'packages/web', name: undefined },
      { path: 'packages/docs', name: undefined },
    ],
  })
})
