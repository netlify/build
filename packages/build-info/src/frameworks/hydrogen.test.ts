import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a Hydrogen v2 site using the Remix Classic Compiler', async ({ fs }) => {
  const cwd = mockFileSystem({
    'remix.config.js': '',
    'package.json': JSON.stringify({
      scripts: {
        build: 'remix build',
        dev: 'remix dev --manual -c "netlify dev"',
        preview: 'netlify serve',
      },
      dependencies: {
        '@netlify/edge-functions': '^2.2.0',
        '@netlify/remix-edge-adapter': '^3.1.0',
        '@netlify/remix-runtime': '^2.1.0',
        '@remix-run/react': '^2.2.0',
        '@shopify/cli': '3.50.0',
        '@shopify/cli-hydrogen': '^6.0.0',
        '@shopify/hydrogen': '^2023.10.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@remix-run/dev': '^2.2.0',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('remix')
  expect(detectedFrameworks).not.toContain('vite')

  expect(detected?.[0]?.id).toBe('hydrogen')
  expect(detected?.[0]?.build?.command).toBe('remix build')
  expect(detected?.[0]?.build?.directory).toBe('public')
  expect(detected?.[0]?.dev?.command).toBe('remix dev --manual -c "netlify dev"')
  expect(detected?.[0]?.dev?.port).toBeUndefined()
})

test('detects a Hydrogen v2 site using Remix Vite', async ({ fs }) => {
  const cwd = mockFileSystem({
    'vite.config.ts': '',
    'package.json': JSON.stringify({
      scripts: {
        build: 'remix vite:build',
        dev: 'shopify hydrogen dev --codegen',
        preview: 'netlify serve',
      },
      dependencies: {
        '@netlify/edge-functions': '^2.10.0',
        '@netlify/remix-edge-adapter': '^3.4.0',
        '@netlify/remix-runtime': '^2.3.0',
        '@remix-run/react': '^2.11.2',
        '@shopify/hydrogen': '^2024.7.4',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@remix-run/dev': '^2.11.2',
        '@shopify/cli': '^3.66.1',
        '@shopify/hydrogen-codegen': '^0.3.1',
        vite: '^5.4.3',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('remix')
  expect(detectedFrameworks).not.toContain('vite')

  expect(detected?.[0]?.id).toBe('hydrogen')
  expect(detected?.[0]?.build?.command).toBe('remix vite:build')
  expect(detected?.[0]?.build?.directory).toBe('dist/client')
  expect(detected?.[0]?.dev?.command).toBe('shopify hydrogen dev')
  expect(detected?.[0]?.dev?.port).toBe(5173)
})
