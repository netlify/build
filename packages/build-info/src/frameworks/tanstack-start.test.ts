import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects a TanStack Start React site (v1.132.0+)', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vite --port 3000',
        start: 'vite --port 3000',
        build: 'vite build',
        serve: 'vite preview',
        test: 'vitest run',
      },
      dependencies: {
        '@tanstack/react-router': '^1.132.0',
        '@tanstack/react-router-devtools': '^1.132.0',
        '@tanstack/react-start': '^1.132.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.4',
        vite: '^7.0.0',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vite build')
  expect(detected?.[0]?.build?.directory).toBe('dist/client')
  expect(detected?.[0]?.dev?.command).toBe('vite dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})

test('sets build dir to `dist` for a pre-v1.132.0 TanStack Start React site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vite --port 3000',
        start: 'vite --port 3000',
        build: 'vite build',
        serve: 'vite preview',
        test: 'vitest run',
      },
      dependencies: {
        '@tanstack/react-router': '^1.131.0',
        '@tanstack/react-router-devtools': '^1.131.0',
        '@tanstack/react-start': '^1.131.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.4',
        vite: '^6.1.0',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vite build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vite dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})

test('sets `vinxi` build/dev commands for a pre-v1.121.0 TanStack Start React site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vinxi dev',
        build: 'vinxi build',
        start: 'vinxi start',
      },
      dependencies: {
        '@tanstack/react-router': '^1.117.1',
        '@tanstack/react-router-devtools': '^1.117.1',
        '@tanstack/react-start': '^1.117.2',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        vinxi: '0.5.3',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vinxi build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vinxi dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})

test('detects a TanStack Start Solid site (v1.132.0+)', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vite --port 3000',
        start: 'vite --port 3000',
        build: 'vite build',
        serve: 'vite preview',
        test: 'vitest run',
      },
      dependencies: {
        '@tanstack/solid-router': '^1.132.0',
        '@tanstack/solid-router-devtools': '^1.132.0',
        '@tanstack/solid-start': '^1.132.0',
        'solid-js': '^1.9.5',
      },
      devDependencies: {
        '@vitejs/plugin-solid': '^4.3.4',
        vite: '^7.0.0',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')
  expect(detectedFrameworks).not.toContain('solid-js')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vite build')
  expect(detected?.[0]?.build?.directory).toBe('dist/client')
  expect(detected?.[0]?.dev?.command).toBe('vite dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})

test('sets build dir to `dist` for a pre-v1.132.0 TanStack Start Solid site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vite --port 3000',
        start: 'vite --port 3000',
        build: 'vite build',
        serve: 'vite preview',
        test: 'vitest run',
      },
      dependencies: {
        '@tanstack/solid-router': '^1.131.0',
        '@tanstack/solid-router-devtools': '^1.131.0',
        '@tanstack/solid-start': '^1.131.0',
        'solid-js': '^1.9.5',
      },
      devDependencies: {
        '@vitejs/plugin-solid': '^4.3.4',
        vite: '^6.1.0',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')
  expect(detectedFrameworks).not.toContain('solid-js')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vite build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vite dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})

test('sets `vinxi` build/dev commands for a pre-v1.121.0 TanStack Start Solid site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vinxi dev',
        build: 'vinxi build',
        start: 'vinxi start',
      },
      dependencies: {
        '@tanstack/solid-router': '^1.117.1',
        '@tanstack/solid-router-devtools': '^1.117.1',
        '@tanstack/solid-start': '^1.117.2',
        'solid-js': '^1.9.5',
      },
      devDependencies: {
        vinxi: '0.5.3',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')
  expect(detectedFrameworks).not.toContain('solid-js')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vinxi build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vinxi dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})

test('detects a pre-v1.111.10 (pre-package-rename) TanStack Start site', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        dev: 'vinxi dev',
        build: 'vinxi build',
        start: 'vinxi start',
      },
      dependencies: {
        '@tanstack/react-router': '^1.58.15',
        '@tanstack/router-devtools': '^1.58.15',
        '@tanstack/start': '^1.58.15',
        react: '^18.3.1',
        'react-dom': '^18.3.1',
      },
      devDependencies: {
        vinxi: '0.4.3',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('vinxi')
  expect(detectedFrameworks).not.toContain('vite')
  expect(detectedFrameworks).not.toContain('tanstack-router')

  expect(detected?.[0]?.id).toBe('tanstack-start')
  expect(detected?.[0]?.build?.command).toBe('vinxi build')
  expect(detected?.[0]?.build?.directory).toBe('dist')
  expect(detected?.[0]?.dev?.command).toBe('vinxi dev')
  expect(detected?.[0]?.dev?.port).toBe(3000)
})
