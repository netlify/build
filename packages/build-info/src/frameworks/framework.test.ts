import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

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

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should detect the frameworks correctly from a pnpm workspace repository root', async ({ fs }) => {
  const cwd = mockFileSystem(PNPMWorkspace)
  const project = new Project(fs, cwd)
  const detection = await project.detectFrameworks()
  expect(detection).toHaveLength(2)

  // expect([...(detection?.values() || [])]).toEqual(expect.arrayContaining([{ id: 'astro' }]))
  // expect(info.frameworks).toHaveLength(2)
})
