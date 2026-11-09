import { beforeEach, expect, test, describe } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

describe('farmjs', () => {
  test('should detect Farm.js', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        scripts: {
          dev: 'farm dev',
          build: 'farm build',
          start: 'node .farm/.output/server/index.mjs',
        },
        dependencies: {
          '@farm.js/core': '0.1.8',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@farm.js/cli': '0.1.8',
        },
      }),
      'farm.config.ts': '',
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('farmjs')
    expect(detected?.[0].name).toBe('Farm.js')
    expect(detected?.[0].build.command).toBe('farm build')
    expect(detected?.[0].build.directory).toBe('dist')
    expect(detected?.[0].dev?.command).toBe('farm dev')
    expect(detected?.[0].dev?.port).toBe(3000)
  })

  test.for([
    ['solid-js', { 'solid-js': '^1.9.0' }],
    ['svelte', { svelte: '^5.0.0' }],
    ['vite', { vite: '^7.0.0' }],
  ] as const)('should prefer Farm.js over %s', async ([, dependencies], { fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        dependencies: { '@farm.js/core': '0.1.8', ...dependencies },
      }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('farmjs')
  })

  test('should not detect the Farm build tool as Farm.js', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        devDependencies: { '@farmfe/cli': '^1.0.0', '@farmfe/core': '^1.0.0' },
      }),
      'farm.config.ts': '',
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.some((framework) => framework.id === 'farmjs')).toBe(false)
  })
})
