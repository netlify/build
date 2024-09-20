import { describe, test, expect, beforeEach } from 'vitest'

import { mockFileSystem } from '../tests/mock-file-system.js'

import { frameworks } from './frameworks/index.js'
import { getFramework } from './get-framework.js'
import { NodeFS } from './node/file-system.js'
import { Project } from './project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should get the correct framework among the others', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      dependencies: {
        astro: '*',
        next: '*',
        gatsby: '*',
      },
    }),
  })
  const project = new Project(fs, cwd)
  expect(await getFramework('gatsby', project)).toMatchObject({
    id: 'gatsby',
  })
  expect(await getFramework('astro', project)).toMatchObject({
    id: 'astro',
  })
})

test('should throw if a unknown framework was requested', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      dependencies: {
        astro: '*',
        next: '*',
        gatsby: '*',
      },
    }),
  })
  const project = new Project(fs, cwd)
  try {
    // need to type any as it's so strict
    await getFramework('unknown' as any, project)
    // expect.fail('should throw')
  } catch (error) {
    const [, frameworksFromMessage] = error.message.match(/It should be one of: (.+)/)
    const frameworksArray = frameworksFromMessage.split(', ')

    expect(frameworksArray).toEqual([...frameworksArray].sort())
  }
  expect.assertions(1)
})

describe('Framework detection honors forced framework', () => {
  for (const Framework of frameworks) {
    test(Framework.name, async ({ fs }) => {
      const cwd = mockFileSystem({})
      const project = new Project(fs, cwd)
      const framework = new Framework(project)

      const detectedFramework = await getFramework(framework.id, project)

      expect(detectedFramework.id).toBe(framework.id)
    })
  }
})
