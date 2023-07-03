import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should not add the plugin if the node version is below 12.13.0', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { gatsby: '^4.0.0' } }),
    'gatsby-config.js': '',
  })
  const detected = await new Project(fs, cwd).setNodeVersion('12.12.9').detectFrameworks()
  expect(detected?.[0].id).toBe('gatsby')
  expect(detected?.[0].plugins).toMatchObject([])
})

test('should detect a simple Gatsby project and add the plugin if the node version is large enough', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { gatsby: '^4.0.0' } }),
    'gatsby-config.js': '',
  })
  const detected = await new Project(fs, cwd).setNodeVersion('12.13.0').detectFrameworks()
  expect(detected?.[0].id).toBe('gatsby')
  expect(detected?.[0].plugins).toMatchObject(['@netlify/plugin-gatsby'])
})

test('should detect a simple Gatsby 4 project', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { gatsby: '^4.0.0' } }),
    'gatsby-config.js': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('gatsby')
  expect(detected?.[0].build.command).toBe('gatsby build')
  expect(detected?.[0].build.directory).toBe('public')
  expect(detected?.[0].env).toMatchObject(
    expect.objectContaining({
      AWS_LAMBDA_JS_RUNTIME: 'nodejs14.x',
      NODE_VERSION: '14',
    }),
  )
})

test('should detect a simple Gatsby 5 project', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { gatsby: '^5.0.0' } }),
    'gatsby-config.js': '',
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('gatsby')
  expect(detected?.[0].env).toMatchObject(
    expect.objectContaining({
      AWS_LAMBDA_JS_RUNTIME: 'nodejs18.x',
      NODE_VERSION: '18',
    }),
  )
})
