import { beforeEach, expect, test, describe } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

describe('hono', () => {
  test('should detect hono', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        scripts: {
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js',
        },
        dependencies: {
          hono: '^4.10.8',
          '@hono/node-server': '^1.19.6',
        },
        devDependencies: {
          '@types/node': '^20.11.17',
          tsx: '^4.7.1',
          typescript: '^5.8.3',
        },
      }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('hono')
    expect(detected?.[0].build.command).toBe('npm run build')
    expect(detected?.[0].build.directory).toBe('dist')
    expect(detected?.[0].dev?.command).toBeUndefined()
  })
})
