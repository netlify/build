import { beforeEach, expect, test, describe } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

describe('mastra', () => {
  test('should detect mastra', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        scripts: {
          dev: 'mastra dev',
          build: 'mastra build',
          start: 'mastra start',
        },
        dependencies: {
          '@mastra/core': '^1.0.0',
          '@mastra/deployer-netlify': '^1.0.0',
        },
        devDependencies: {
          mastra: '^1.0.0',
        },
      }),
    })
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('mastra')
    expect(detected?.[0].build.command).toBe('mastra build')
    expect(detected?.[0].dev?.command).toBe('mastra dev')
    expect(detected?.[0].build.directory).toBe('.mastra')
  })
})
