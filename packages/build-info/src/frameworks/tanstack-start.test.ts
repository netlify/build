import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a TanStack Start site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vinxi dev',
        build: 'vinxi build',
        start: 'vinxi start',
      },
      dependencies: {
        '@tanstack/react-router': '^1.58.15',
        '@tanstack/router-devtools': '^1.58.15',
        '@tanstack/start': '^1.58.15',
        react: '^18.3.1',
        'react-dom': '^18.3.1',
      },
      devDependencies: {
        vinxi: '0.4.3',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vinxi build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vinxi dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})
