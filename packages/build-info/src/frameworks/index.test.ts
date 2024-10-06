import { test, expect, describe } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

import { frameworks } from './index.js'

describe('framework config validation', () => {
  const fs = new NodeFS()
  const cwd = mockFileSystem({})
  const project = new Project(fs, cwd)

  // We have heuristics that look for these commands nested within user `package.json#scripts` commands. If our command
  // is a shorthand alias (e.g. `vite`, alias of `vite dev`) then it will also match all of that runner's commands
  // (e.g. `vite build`). This is the best we could come up with to avoid that.
  test.each(
    frameworks.map((Framework) => {
      const framework = new Framework(project)
      return [framework.name, framework]
    }),
  )(`framework %s dev command includes at least one space`, (_, framework) => {
    if (framework.dev?.command) expect(framework.dev.command).toMatch(/\s/)
  })

  test.each(
    frameworks.map((Framework) => {
      const framework = new Framework(project)
      return [framework.name, framework]
    }),
  )(`framework %s build command includes at least one space`, (_, framework) => {
    if (framework.build?.command) expect(framework.build.command).toMatch(/\s/)
  })
})
