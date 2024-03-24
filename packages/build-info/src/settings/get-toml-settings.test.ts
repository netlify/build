import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

import { getTomlSettings } from './get-toml-settings.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
})

test('get the settings from the toml of the base directory', async ({ fs }) => {
  const cwd = mockFileSystem({
    'netlify.toml': '[build]\ncommand = "npm run build"',
  })
  fs.cwd = cwd
  const project = new Project(fs, cwd)
  const settings = await getTomlSettings(project)

  expect(settings).toEqual(
    expect.objectContaining({
      buildCommand: 'npm run build',
    }),
  )
})

test('get the settings from the toml of the repository root', async ({ fs }) => {
  const cwd = mockFileSystem({
    'netlify.toml': '[build]\ncommand = "npm run buld"',
    'frontend/package.json': JSON.stringify({ name: 'project' }),
  })
  fs.cwd = cwd
  const project = new Project(fs, join(cwd, 'frontend'), cwd)
  const settings = await getTomlSettings(project)

  expect(settings).toEqual(
    expect.objectContaining({
      buildCommand: 'npm run buld',
    }),
  )
})

test('get the settings from the toml of the base directory and not from the root', async ({ fs }) => {
  const cwd = mockFileSystem({
    'netlify.toml': '[build]\ncommand = "npm run buld"',
    'frontend/package.json': JSON.stringify({ name: 'project' }),
    'frontend/netlify.toml': '[build]\ncommand = "take this"',
  })
  fs.cwd = cwd
  const project = new Project(fs, join(cwd, 'frontend'), cwd)
  const settings = await getTomlSettings(project)

  expect(settings).toEqual(
    expect.objectContaining({
      buildCommand: 'take this',
    }),
  )
})

test('get the settings from the toml of the base directory and not from the root', async ({ fs }) => {
  const cwd = mockFileSystem({
    'netlify.toml': '[build]\ncommand = "npm run buld"',
    'frontend/package.json': JSON.stringify({ name: 'project' }),
    'frontend/netlify.toml': '[build]\ncommand = "yarn build"',
    'frontend/other/path/netlify.toml': '[build]\ncommand = "take this"',
  })
  fs.cwd = cwd
  const project = new Project(fs, join(cwd, 'frontend'), cwd)
  const settings = await getTomlSettings(project, 'frontend/other/path/netlify.toml')

  expect(settings).toEqual(
    expect.objectContaining({
      buildCommand: 'take this',
    }),
  )
})

test('get all toml fields that are important', async ({ fs }) => {
  const cwd = mockFileSystem({
    'netlify.toml': `
[build]
command = "next build"
publish = ".next"
functions = "api"

[dev]
command = "next"
port = 3000

[[plugins]]
package = "@netlify/plugin-nextjs"
    `,
  })
  fs.cwd = cwd
  const project = new Project(fs, cwd)
  const settings = await getTomlSettings(project)

  expect(settings).toEqual(
    expect.objectContaining({
      buildCommand: 'next build',
      devCommand: 'next',
      dist: '.next',
      frameworkPort: 3000,
      functionsDir: 'api',
      plugins: [{ package: '@netlify/plugin-nextjs', source: 'toml' }],
    }),
  )
})
