import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a TanStack Router site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vite --port=3001',
        build: 'vite build && tsc --noEmit',
        serve: 'vite preview',
        start: 'vite',
      },
      dependencies: {
        '@tanstack/react-router': '^1.58.15',
        '@tanstack/router-devtools': '^1.58.15',
        '@tanstack/router-plugin': '^1.58.12',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        vite: '^5.4.5',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-start')

  expect(detected?.[0]?.id).toBe('tanstack-router')
  expect(detected?.[0]?.build?.command).toBe('vite build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vite dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})
