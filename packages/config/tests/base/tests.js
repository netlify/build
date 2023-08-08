import { join } from 'path'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('Base from defaultConfig', async (t) => {
  const output = await new Fixture('./fixtures/default_config')
    .withFlags({ defaultConfig: { build: { base: 'base' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Base from configuration file property', async (t) => {
  const output = await new Fixture('./fixtures/prop_config').runWithConfig()
  t.snapshot(normalizeOutput(output))
  const {
    buildDir,
    config: {
      build: { base, edge_functions: edgeFunctions, publish },
      functionsDirectory,
    },
  } = JSON.parse(output)
  t.is(base, buildDir)
  t.true(functionsDirectory.startsWith(buildDir))
  t.true(edgeFunctions.startsWith(buildDir))
  t.true(publish.startsWith(buildDir))
})

test('Base logic is not recursive', async (t) => {
  const output = await new Fixture('./fixtures/recursive').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('BaseRelDir feature flag', async (t) => {
  const output = await new Fixture('./fixtures/prop_config').withFlags({ baseRelDir: false }).runWithConfig()
  t.snapshot(normalizeOutput(output))
  const {
    buildDir,
    config: {
      build: { base, edge_functions: edgeFunctions, publish },
      functionsDirectory,
    },
  } = JSON.parse(output)
  t.is(base, buildDir)

  t.false(functionsDirectory.startsWith(buildDir))
  t.false(edgeFunctions.startsWith(buildDir))
  t.false(publish.startsWith(buildDir))
})

test('Base directory does not exist', async (t) => {
  const output = await new Fixture('./fixtures/base_invalid').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Use "base" as default value for "publish"', async (t) => {
  const output = await new Fixture('./fixtures/base_without_publish').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Use "base" as "publish" when it is an empty string', async (t) => {
  const output = await new Fixture('./fixtures/base_without_publish')
    .withFlags({ defaultConfig: { build: { publish: '' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Use "base" as "publish" when it is /', async (t) => {
  const output = await new Fixture('./fixtures/base_without_publish')
    .withFlags({ defaultConfig: { build: { publish: '/' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Monorepo with package path retrieving _redirects', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-1',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  t.like(config, {
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

test('Monorepo with redirects from the publish directory', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo-with-root-files').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-1',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  t.like(config, {
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

test('Monorepo with redirects from the top should be joined', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo-with-root-files').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-2',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  t.like(config, {
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

test('Monorepo with package path retrieving _headers', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-2',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  t.like(config, {
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

test('Monorepo with serverless functions', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture
  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-3',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  t.like(config, {
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

test('Monorepo with custom serverless function directory', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-6',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  t.like(config, {
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

test('Monorepo with edge functions', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-4',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  t.like(config, {
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

test('Monorepo with custom edge function directory', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-5',
    })
    .runWithConfig()
  const config = JSON.parse(output)

  t.like(config, {
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

test('Monorepo with base field', async (t) => {
  const fixture = await new Fixture('./fixtures').withCopyRoot()
  const { repositoryRoot } = fixture

  const output = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      base: 'monorepo',
      packagePath: 'apps/app-2',
    })
    .runWithConfig()

  const config = JSON.parse(output)
  t.like(config, {
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
