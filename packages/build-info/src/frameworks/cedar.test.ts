import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

const cedarToml = `
# This file contains the configuration settings for your Cedar app.
# This file is also what makes your Cedar app a Cedar app.
# If you remove it and try to run \`yarn cedar dev\`, you'll get an error.
#
# For the full list of options, see the "App Configuration: cedar.toml" doc:
# https://cedarjs.com/docs/app-configuration-cedar-toml

[web]
  title = "Cedar App"
  port = 8910
  apiUrl = "/.redwood/functions"
  includeEnvironmentVariables = [
    # Add any ENV vars that should be available to the web side to this array
    # See https://cedarjs.com/docs/environment-variables#web
  ]
[api]
  port = 8911
[browser]
  open = true
[notifications]
  versionUpdates = ["latest"]
`

test('should detect cedar', async ({ fs }) => {
  const cwd = mockFileSystem({
    'cedar.toml': cedarToml,
    'package.json': JSON.stringify({
      private: true,
      workspaces: {
        packages: ['api', 'web'],
      },
      devDependencies: {
        '@cedarjs/core': '2.8.0',
      },
      eslintConfig: {
        extends: '@cedarjs/eslint-config',
        root: true,
      },
      engines: {
        node: '=24.x',
      },
      packageManager: 'yarn@4.12.0',
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
        '@cedarjs/forms': '2.8.0',
        '@cedarjs/router': '2.8.0',
        '@cedarjs/web': '2.8.0',
        react: '18.3.1',
        'react-dom': '18.3.1',
      },
      devDependencies: {
        '@cedarjs/vite': '2.8.0',
        '@types/react': '^18.2.55',
        '@types/react-dom': '^18.2.19',
      },
    }),
    'api/package.json': JSON.stringify({
      name: 'api',
      version: '0.0.0',
      private: true,
      dependencies: {
        '@cedarjs/api': '2.8.0',
        '@cedarjs/graphql-server': '2.8.0',
      },
    }),
  })

  const project = new Project(fs, cwd, cwd)

  expect(await project.detectWorkspaces()).toBeNull()
  const detected = await project.detectFrameworks()

  expect(detected).toHaveLength(1)
  expect(detected?.[0].id).toBe('cedarjs')
  expect(detected?.[0].name).toBe('CedarJS')
  expect(detected?.[0].build.command).toBe('cedar deploy netlify')
  expect(detected?.[0].build.directory).toBe('web/dist')
  expect(detected?.[0].dev?.command).toBe('yarn cedar dev')
  expect(detected?.[0].env.NODE_VERSION).toBe('24')
  expect(detected?.[0].env.AWS_LAMBDA_JS_RUNTIME).toBe('nodejs24.x')
})
