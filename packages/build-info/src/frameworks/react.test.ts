import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

let fs: NodeFS

beforeEach(() => {
  fs = new NodeFS()
})

test.each([['dependency', { 'package.json': JSON.stringify({ dependencies: { 'react-scripts': '*' } }) }]])(
  'should detect Create React App via the %s',
  async (_, files) => {
    const cwd = mockFileSystem(files)
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('create-react-app')
    expect(detected?.[0].name).toBe('Create React App')
    expect(detected?.[0].build.command).toBe('react-scripts build')
    expect(detected?.[0].build.directory).toBe('build')
    expect(detected?.[0].staticAssetsDirectory).toBe('public')
    expect(detected?.[0].dev?.command).toBe('react-scripts start')
    expect(detected?.[0].dev?.port).toBe(3000)
  },
)
