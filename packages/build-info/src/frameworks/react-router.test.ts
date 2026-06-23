import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})
test('detects a site using React Router v7 as a framework', async ({ fs }) => {
  const cwd = mockFileSystem({
    'react-router.config.ts': '',
    'vite.config.ts': '',
    'package.json': JSON.stringify({
      scripts: {
        build: 'react-router build',
        dev: 'react-router dev',
        start: 'react-router-serve ./build/server/index.js',
        typecheck: 'react-router typegen && tsc',
      },
      dependencies: {
        '@react-router/node': '^7.0.2',
        '@react-router/serve': '^7.0.2',
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router': '^7.0.2',
      },
      devDependencies: {
        '@netlify/vite-plugin-react-router': '^1.0.0',
        '@react-router/dev': '^7.0.2',
        typescript: '^5.6.3',
        vite: '^5.4.11',
        'vite-tsconfig-paths': '^5.1.2',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  expect(detected?.length).toBe(1)

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('remix')

  expect(detected?.[0]?.id).toBe('react-router')
  expect(detected?.[0]?.build?.command).toBe('react-router build')
  expect(detected?.[0]?.build?.directory).toBe('build/client')
  expect(detected?.[0]?.dev?.command).toBe('react-router dev')
  expect(detected?.[0]?.dev?.port).toBe(5173)
})

test('does NOT detect a site using React Router v7 as a library', async ({ fs }) => {
  const cwd = mockFileSystem({
    'rollup.config.ts': '',
    'package.json': JSON.stringify({
      scripts: {
        build: 'rollup build',
        dev: 'rollup dev',
        typecheck: 'react-router typegen && tsc',
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router': '^7.0.2',
      },
      devDependencies: {
        rollup: '^4.28.1',
        typescript: '^5.6.3',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('react-router')
})

test('does NOT detect a React Router <v7 site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'vite.config.ts': '',
    'package.json': JSON.stringify({
      scripts: {
        build: 'vite build',
        dev: 'vite dev',
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.15.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^3.0.1',
        typescript: '^4.9.5',
        vite: '^4.0.4',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('react-router')

  expect(detected?.[0]?.id).toBe('vite')
})
