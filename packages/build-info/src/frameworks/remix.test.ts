import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})
;[
  [
    'with origin SSR',
    {
      'vite.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix vite:build',
          dev: 'remix vite:dev',
          start: 'remix-serve ./build/server/index.js',
        },
        dependencies: {
          '@remix-run/node': '^2.9.2',
          '@remix-run/react': '^2.9.2',
          '@remix-run/serve': '^2.9.2',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@netlify/remix-adapter': '^2.4.0',
          '@remix-run/dev': '^2.9.2',
          '@types/react': '^18.2.20',
          '@types/react-dom': '^18.2.7',
          vite: '^5.0.0',
          'vite-tsconfig-paths': '^4.2.1',
        },
      }),
    },
  ] as const,
  [
    'with edge SSR',
    {
      'vite.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix vite:build',
          dev: 'remix vite:dev',
          start: 'remix-serve ./build/server/index.js',
        },
        dependencies: {
          '@netlify/remix-runtime': '^2.3.0',
          '@remix-run/node': '^2.9.2',
          '@remix-run/react': '^2.9.2',
          '@remix-run/serve': '^2.9.2',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@netlify/remix-edge-adapter': '^3.3.0',
          '@remix-run/dev': '^2.9.2',
          '@types/react': '^18.2.20',
          '@types/react-dom': '^18.2.7',
          vite: '^5.0.0',
          'vite-tsconfig-paths': '^4.2.1',
        },
      }),
    },
  ] as const,
].forEach(([description, files]) =>
  test(`detects a Remix Vite site ${description}`, async ({ fs }) => {
    const cwd = mockFileSystem(files)
    const detected = await new Project(fs, cwd).detectFrameworks()

    const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
    expect(detectedFrameworks).not.toContain('vite')

    expect(detected?.[0]?.id).toBe('remix')
    expect(detected?.[0]?.build?.command).toBe('remix vite:build')
    expect(detected?.[0]?.build?.directory).toBe('build/client')
    expect(detected?.[0]?.dev?.command).toBe('remix vite:dev')
    expect(detected?.[0]?.dev?.port).toBe(5173)
  }),
)
;[
  [
    'with origin SSR',
    {
      'remix.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix build',
          dev: 'remix dev',
          start: 'netlify serve',
          typecheck: 'tsc',
        },
        dependencies: {
          '@netlify/functions': '^2.8.1',
          '@remix-run/css-bundle': '^2.9.2',
          '@remix-run/node': '^2.9.2',
          '@remix-run/react': '^2.9.2',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@netlify/remix-adapter': '^2.4.0',
          '@remix-run/dev': '^2.9.2',
          '@remix-run/serve': '^2.9.2',
        },
      }),
    },
  ] as const,
  [
    'with edge SSR',
    {
      'remix.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix build',
          dev: 'remix dev',
          start: 'netlify serve',
          typecheck: 'tsc',
        },
        dependencies: {
          '@netlify/functions': '^2.8.1',
          '@netlify/remix-runtime': '^2.3.0',
          '@remix-run/css-bundle': '^2.9.2',
          '@remix-run/node': '^2.9.2',
          '@remix-run/react': '^2.9.2',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@netlify/remix-edge-adapter': '^3.3.0',
          '@remix-run/dev': '^2.9.2',
          '@remix-run/serve': '^2.9.2',
        },
      }),
    },
  ] as const,
  [
    'with origin SSR via our legacy packages',
    {
      'remix.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix build',
          dev: 'remix dev',
          start: 'netlify serve',
          typecheck: 'tsc',
        },
        dependencies: {
          '@remix-run/netlify': '1.7.4',
          '@remix-run/node': '1.7.4',
          '@remix-run/react': '1.7.4',
          react: '18.2.0',
          'react-dom': '18.2.0',
        },
        devDependencies: {
          '@netlify/functions': '^1.0.0',
          '@remix-run/dev': '1.7.4',
          '@remix-run/serve': '1.7.4',
        },
      }),
    },
  ] as const,
  [
    'with edge SSR via our legacy packages',
    {
      'remix.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix build',
          dev: 'remix dev',
          start: 'netlify serve',
          typecheck: 'tsc',
        },
        dependencies: {
          '@remix-run/netlify-edge': '1.7.4',
          '@remix-run/node': '1.7.4',
          '@remix-run/react': '1.7.4',
          react: '18.2.0',
          'react-dom': '18.2.0',
        },
        devDependencies: {
          '@netlify/functions': '^1.0.0',
          '@remix-run/dev': '1.7.4',
          '@remix-run/serve': '1.7.4',
        },
      }),
    },
  ] as const,
  [
    'with origin SSR and the legacy remix package',
    {
      'remix.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix build',
          dev: 'remix dev',
          start: 'netlify serve',
          typecheck: 'tsc',
        },
        dependencies: {
          '@remix-run/netlify': '1.7.4',
          remix: '1.7.4',
          react: '18.2.0',
          'react-dom': '18.2.0',
        },
        devDependencies: {
          '@netlify/functions': '^1.0.0',
        },
      }),
    },
  ] as const,
  [
    'with edge SSR and the legacy remix package',
    {
      'remix.config.js': '',
      'package.json': JSON.stringify({
        scripts: {
          build: 'remix build',
          dev: 'remix dev',
          start: 'netlify serve',
          typecheck: 'tsc',
        },
        dependencies: {
          '@remix-run/netlify-edge': '1.7.4',
          remix: '1.7.4',
          react: '18.2.0',
          'react-dom': '18.2.0',
        },
        devDependencies: {
          '@netlify/functions': '^1.0.0',
        },
      }),
    },
  ] as const,
].forEach(([description, files]) =>
  test(`detects a Remix Classic Compiler site ${description}`, async ({ fs }) => {
    const cwd = mockFileSystem(files)
    const detected = await new Project(fs, cwd).detectFrameworks()

    const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
    expect(detectedFrameworks).not.toContain('vite')

    expect(detected?.[0]?.id).toBe('remix')
    expect(detected?.[0]?.build?.command).toBe('remix build')
    expect(detected?.[0]?.build?.directory).toBe('public')
    expect(detected?.[0]?.dev?.command).toBe('remix watch')
    expect(detected?.[0]?.dev?.port).toBeUndefined()
  }),
)

test('does not detect an invalid Remix site with no config file', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: {
        build: 'remix vite:build',
        dev: 'remix vite:dev',
        start: 'remix-serve ./build/server/index.js',
      },
      dependencies: {
        '@netlify/remix-runtime': '^2.3.0',
        '@remix-run/node': '^2.9.2',
        '@remix-run/react': '^2.9.2',
        '@remix-run/serve': '^2.9.2',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@netlify/remix-edge-adapter': '^3.3.0',
        '@remix-run/dev': '^2.9.2',
        '@types/react': '^18.2.20',
        '@types/react-dom': '^18.2.7',
        vite: '^5.0.0',
        'vite-tsconfig-paths': '^4.2.1',
      },
    }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()

  const detectedFrameworks = (detected ?? []).map((framework) => framework.id)
  expect(detectedFrameworks).not.toContain('remix')
})
