import { join } from 'path'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

test('Base from defaultConfig', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_config')
    .withFlags({ defaultConfig: { build: { base: 'base' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Base from configuration file property', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/prop_config').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
  const {
    buildDir,
    config: {
      build: { base, edge_functions: edgeFunctions, publish },
      functionsDirectory,
    },
  } = JSON.parse(output)
  expect(base).toBe(buildDir)
  expect(functionsDirectory.startsWith(buildDir)).toBe(true)
  expect(edgeFunctions.startsWith(buildDir)).toBe(true)
  expect(publish.startsWith(buildDir)).toBe(true)
})

test('Base logic is not recursive', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/recursive').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('BaseRelDir feature flag', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/prop_config')
    .withFlags({ baseRelDir: false })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
  const {
    buildDir,
    config: {
      build: { base, edge_functions: edgeFunctions, publish },
      functionsDirectory,
    },
  } = JSON.parse(output)
  expect(base).toBe(buildDir)

  expect(functionsDirectory.startsWith(buildDir)).toBe(false)
  expect(edgeFunctions.startsWith(buildDir)).toBe(false)
  expect(publish.startsWith(buildDir)).toBe(false)
})

test('Base directory does not exist', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/base_invalid').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Use "base" as default value for "publish"', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/base_without_publish').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Use "base" as "publish" when it is an empty string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/base_without_publish')
    .withFlags({ defaultConfig: { build: { publish: '' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Use "base" as "publish" when it is /', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/base_without_publish')
    .withFlags({ defaultConfig: { build: { publish: '/' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Monorepo with package path retrieving _redirects', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-1',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        publish: join(repositoryRoot, 'apps/app-1'),
      },
      redirects: [
        {
          conditions: {},
          force: true,
          from: '/from',
          headers: {},
          query: {},
          status: 200,
          to: '/to',
        },
      ],
    },
    headersPath: join(repositoryRoot, 'apps/app-1/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-1/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with redirects from the publish directory', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo-with-root-files').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-1',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        publish: join(repositoryRoot, 'apps/app-1/dist'),
      },
      redirects: [
        {
          conditions: {},
          force: true,
          from: '/from',
          headers: {},
          query: {},
          status: 200,
          to: '/to',
        },
      ],
    },
    headersPath: join(repositoryRoot, 'apps/app-1/dist/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-1/dist/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with redirects from the top should be joined', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo-with-root-files').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-2',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        publish: join(repositoryRoot, 'apps/app-2'),
      },
      redirects: [
        {
          conditions: {},
          force: true,
          from: '/from',
          headers: {},
          query: {},
          status: 200,
          to: '/to',
        },
        {
          conditions: {},
          force: false,
          from: '/old-path',
          headers: {},
          query: {},
          status: 301,
          to: '/new-path',
        },
      ],
    },
    headersPath: join(repositoryRoot, 'apps/app-2/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-2/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with package path retrieving _headers', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-2',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        publish: join(repositoryRoot, 'apps/app-2'),
      },
      headers: [
        {
          for: '/*',
          values: {
            'X-Frame-Options': 'DENY',
          },
        },
      ],
    },
    headersPath: join(repositoryRoot, 'apps/app-2/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-2/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with serverless functions', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture
  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-3',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        environment: {},
        publish: join(repositoryRoot, 'apps/app-3/dist'),
        functions: join(repositoryRoot, 'apps/app-3/netlify/functions'),
        command: 'npm run build',
        commandOrigin: 'config',
      },
      functions: { '*': {} },
      functionsDirectory: join(repositoryRoot, 'apps/app-3/netlify/functions'),
      functionsDirectoryOrigin: 'default',
    },
    configPath: join(repositoryRoot, 'apps/app-3/netlify.toml'),
    headersPath: join(repositoryRoot, 'apps/app-3/dist/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-3/dist/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with custom serverless function directory', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-6',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        environment: {},
        publish: join(repositoryRoot, 'apps/app-6'),
        functions: join(repositoryRoot, 'apps/app-6/custom-dir'),
      },
      functions: { '*': { node_bundler: 'esbuild' } },
      functionsDirectory: join(repositoryRoot, 'apps/app-6/custom-dir'),
      functionsDirectoryOrigin: 'config',
    },
    headersPath: join(repositoryRoot, 'apps/app-6/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-6/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with edge functions', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-4',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        environment: {},
        publish: join(repositoryRoot, 'apps/app-4'),
        edge_functions: join(repositoryRoot, 'apps/app-4/netlify/edge-functions'),
      },
      edge_functions: [
        {
          function: 'hello',
          path: '/hello',
        },
      ],
    },
    headersPath: join(repositoryRoot, 'apps/app-4/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-4/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with custom edge function directory', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-5',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  expect(config).toMatchObject({
    buildDir: repositoryRoot,
    config: {
      build: {
        environment: {},
        publish: join(repositoryRoot, 'apps/app-5'),
        edge_functions: join(repositoryRoot, 'apps/app-5/custom-dir'),
      },
      edge_functions: [
        {
          function: 'hello',
          path: '/hello',
        },
      ],
    },
    headersPath: join(repositoryRoot, 'apps/app-5/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'apps/app-5/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with base field', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      base: 'monorepo',
      packagePath: 'apps/app-2',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  expect(config).toMatchObject({
    buildDir: join(repositoryRoot, 'monorepo'),
    config: {
      build: {
        publish: join(repositoryRoot, 'monorepo/apps/app-2'),
      },
      headers: [{ for: '/*', values: { 'X-Frame-Options': 'DENY' } }],
    },
    headersPath: join(repositoryRoot, 'monorepo/apps/app-2/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'monorepo/apps/app-2/_redirects'),
    repositoryRoot,
  })
})

test('Monorepo with base field and build plugin', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      base: 'monorepo',
      packagePath: 'apps/app-7',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  expect(config).toMatchObject({
    buildDir: join(repositoryRoot, 'monorepo'),
    configPath: join(repositoryRoot, 'monorepo/apps/app-7/netlify.toml'),
    config: {
      build: {
        publish: join(repositoryRoot, 'monorepo/apps/app-7'),
      },
      plugins: [
        {
          inputs: {},
          origin: 'config',
          package: '/apps/app-7/build-plugin',
        },
      ],
    },
    headersPath: join(repositoryRoot, 'monorepo/apps/app-7/_headers'),
    integrations: [],
    redirectsPath: join(repositoryRoot, 'monorepo/apps/app-7/_redirects'),
    repositoryRoot,
  })
})
