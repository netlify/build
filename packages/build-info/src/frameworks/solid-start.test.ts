import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects and configures a SolidStart site that uses the old `solid-start` package', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'solid-start dev',
        build: 'solid-start build',
        start: 'solid-start start',
      },
      dependencies: {
        '@solidjs/meta': '^0.28.5',
        '@solidjs/router': '^0.8.2',
        'solid-js': '^1.7.8',
        'solid-start': '^0.2.26',
      },
      devDependencies: {
        'solid-start-netlify': '^0.2.26',
        'solid-start-node': '^0.2.26',
        vite: '3.2.5',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('solidjs')

  expect(detected?.[0]?.id).toBe('solid-start')
  expect(detected?.[0]?.build?.command).toBe('solid-start build')
  expect(detected?.[0]?.build?.directory).toBe('netlify')
  expect(detected?.[0]?.dev?.command).toBe('solid-start dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})

test('detects and configures a SolidStart site that uses the new `@solidjs/start` package', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vinxi dev',
        build: 'vinxi build',
        start: 'vinxi start',
      },
      dependencies: {
        '@solidjs/router': '^0.14.1',
        '@solidjs/start': '^1.0.6',
        'solid-js': '^1.8.18',
      },
      devDependencies: {
        vinxi: '^0.4.1',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('solidjs')

  expect(detected?.[0]?.id).toBe('solid-start')
  expect(detected?.[0]?.build?.command).toBe('vinxi build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vinxi dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})
