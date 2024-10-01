import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a Solid.js site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        start: 'vite',
        dev: 'vite',
        build: 'vite build',
        serve: 'vite preview',
      },
      dependencies: {
        'solid-js': '^1.8.11',
      },
      devDependencies: {
        'solid-devtools': '^0.29.2',
        vite: '^5.0.11',
        'vite-plugin-solid': '^2.8.2',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('solid-start')

  expect(detected?.[0]?.id).toBe('solid-js')
  expect(detected?.[0]?.build?.command).toBe('vite build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vite dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})
