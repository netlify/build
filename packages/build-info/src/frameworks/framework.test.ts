import { join } from 'path'

import { expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { getBuildInfo } from '../node/get-build-info.js'

const PNPMWorkspace: Record<string, string> = {
  'pnpm-workspace.yaml': `packages:\n- packages/*`,
  'package.json': JSON.stringify({ packageManager: 'pnpm@7.14.2' }),
  'packages/blog/package.json': JSON.stringify({
    scripts: { dev: 'astro dev', build: 'astro build' },
    dependencies: { astro: '^1.5.1' },
  }),
  'packages/blog/astro.config.mjs': '',
  'packages/website/next.config.js': '',
  'packages/website/package.json': JSON.stringify({
    scripts: { dev: 'next dev', build: 'next build' },
    dependencies: { next: '~12.3.1', react: '18.2.9', 'react-dom': '18.2.9' },
  }),
}

test('should detect the frameworks correctly from a pnpm workspace repository root', async () => {
  const cwd = mockFileSystem(PNPMWorkspace)

  const info = await getBuildInfo(cwd)
  expect(info).toMatchInlineSnapshot(`
    {
      "buildSystems": [],
      "frameworks": [
        {
          "id": "astro",
          "name": "Astro",
          "paths": [
            "packages/blog",
          ],
        },
        {
          "id": "next",
          "name": "Next.js",
          "paths": [
            "packages/website",
          ],
        },
      ],
      "jsWorkspaces": {
        "isRoot": true,
        "packages": [
          "packages/blog",
          "packages/website",
        ],
        "rootDir": "/home/test-user/test",
      },
      "packageManager": {
        "forceEnvironment": "NETLIFY_USE_PNPM",
        "installCommand": "pnpm install",
        "lockFile": "pnpm-lock.yaml",
        "name": "pnpm",
        "runCommand": "pnpm run",
      },
    }
  `)
})
