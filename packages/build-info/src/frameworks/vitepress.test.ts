import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a Vitepress site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      private: true,
      type: 'module',
      scripts: {
        'docs:dev': 'vitepress dev docs',
        'docs:build': 'vitepress build docs',
        'docs:preview': 'vitepress preview docs',
      },
      devDependencies: {
        vitepress: '^2.0.0-alpha',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.length).toBe(1)

  expect(detected?.[0]?.id).toBe('vitepress')
  expect(detected?.[0]?.build?.command).toBe('vitepress build')
  expect(detected?.[0]?.build?.directory).toBe('.vitepress/dist')
  expect(detected?.[0]?.dev?.command).toBe('vitepress dev')
  expect(detected?.[0]?.dev?.port).toBe(5173)
})
