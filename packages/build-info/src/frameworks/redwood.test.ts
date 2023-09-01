import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

const redwoodToml = `
# This file contains the configuration settings for your Redwood app.
# This file is also what makes your Redwood app a Redwood app.
# If you remove it and try to run "yarn rw dev", you'll get an error.
#
# For the full list of options, see the "App Configuration: redwood.toml" doc:
# https://redwoodjs.com/docs/app-configuration-redwood-toml

[web]
  title = "Redwood App"
  port = 8910
  apiUrl = "/.netlify/functions"
  includeEnvironmentVariables = [
    # Add any ENV vars that should be available to the web side to this array
    # See https://redwoodjs.com/docs/environment-variables#web
  ]
[api]
  port = 8911
[browser]
  open = true
[notifications]
  versionUpdates = ["latest"]
`

test('should detect redwood', async ({ fs }) => {
  const cwd = mockFileSystem({
    'redwood.toml': redwoodToml,
    'package.json': JSON.stringify({
      private: true,
      workspaces: {
        packages: ['api', 'web'],
      },
      devDependencies: {
        '@redwoodjs/core': '6.1.0',
      },
      eslintConfig: {
        extends: '@redwoodjs/eslint-config',
        root: true,
      },
      engines: {
        node: '=18.x',
        yarn: '>=1.15',
      },
      prisma: {
        seed: 'yarn rw exec seed',
      },
      packageManager: 'yarn@3.6.1',
    }),
    'web/package.json': JSON.stringify({
      name: 'web',
      version: '0.0.0',
      private: true,
      browserslist: {
        development: ['last 1 version'],
        production: ['defaults'],
      },
      dependencies: {
        '@redwoodjs/forms': '6.1.0',
        '@redwoodjs/router': '6.1.0',
        '@redwoodjs/web': '6.1.0',
        'humanize-string': '2.1.0',
        'prop-types': '15.8.1',
        react: '18.2.0',
        'react-dom': '18.2.0',
      },
      devDependencies: {
        '@redwoodjs/vite': '6.1.0',
      },
    }),
    'api/package.json': JSON.stringify({
      name: 'api',
      version: '0.0.0',
      private: true,
      dependencies: {
        '@redwoodjs/api': '6.1.0',
        '@redwoodjs/graphql-server': '6.1.0',
      },
    }),
  })

  const project = new Project(fs, cwd, cwd)

  expect(await project.detectWorkspaces()).toBeNull()
  const detected = await project.detectFrameworks()

  expect(detected).toHaveLength(1)
  expect(detected?.[0].id).toBe('redwoodjs')
  expect(detected?.[0].name).toBe('RedwoodJS')
  expect(detected?.[0].build.command).toBe('rw deploy netlify')
  expect(detected?.[0].build.directory).toBe('web/dist')
  expect(detected?.[0].dev?.command).toBe('yarn rw dev')
})
