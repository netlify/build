import { mkdtemp, readFile, readdir, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

import { applyMutations, cleanupConfig, mergeConfigs, restoreConfig, updateConfig } from '@netlify/config'
import { afterEach, beforeEach, expect, test } from 'vitest'

test('mergeConfigs() with concatenateArrays puts later plugins first, without merging them by package', () => {
  const merged = mergeConfigs(
    [
      { plugins: [{ package: 'one', inputs: { a: 1 } }] },
      { plugins: [{ package: 'two' }, { package: 'one', inputs: { b: 2 } }] },
      { plugins: [{ package: 'three' }] },
    ],
    { concatenateArrays: true },
  )

  expect(merged).toEqual({
    build: {},
    plugins: [
      { package: 'three' },
      { package: 'two' },
      { package: 'one', inputs: { b: 2 } },
      { package: 'one', inputs: { a: 1 } },
    ],
  })
})

test('cleanupConfig() prints properties in a fixed order', () => {
  const cleaned = cleanupConfig({
    functionsDirectory: '/repo/netlify/functions',
    functions: { '*': { node_bundler: 'esbuild' } },
    baseRelDir: true,
    redirectsOrigin: 'config',
    redirects: [{ from: '/a', to: '/b' }],
    headersOrigin: 'config',
    headers: [{ for: '/', values: { a: 'b' } }],
    plugins: [{ package: 'plugin', origin: 'config', inputs: {} }],
    build: {
      publishOrigin: 'config',
      publish: '/repo/dist',
      processing: { css: { bundle: true } },
      ignore: 'false',
      edge_functions: '/repo/netlify/edge-functions',
      environment: { NAME: 'value' },
      commandOrigin: 'config',
      command: 'npm run build',
      base: '/repo',
    },
  }) as { build: object }

  // Current behaviour: environment and processing come last in build, and build after the other scalar properties.
  expect(Object.keys(cleaned)).toEqual([
    'headersOrigin',
    'redirectsOrigin',
    'baseRelDir',
    'functionsDirectory',
    'functions',
    'build',
    'plugins',
    'headers',
    'redirects',
  ])
  expect(Object.keys(cleaned.build)).toEqual([
    'base',
    'command',
    'commandOrigin',
    'edge_functions',
    'ignore',
    'publish',
    'publishOrigin',
    'environment',
    'processing',
  ])
})

test('applyMutations() does not reject build properties during dev events', () => {
  expect(
    applyMutations({}, [
      { keys: ['build', 'command'], value: 'npm run dev', event: 'onPreDev' },
      { keys: ['build', 'publish'], value: 'dist', event: 'onDev' },
    ]),
  ).toEqual({ build: { command: 'npm run dev', publish: 'dist' } })
})

test('applyMutations() rejects dev properties during build events', () => {
  expect(() => {
    applyMutations({}, [{ keys: ['dev', 'processing'], value: {}, event: 'onPreBuild' }])
  }).toThrow('"netlifyConfig.dev.processing" cannot be modified after "onPreDev".')
})

const deepFreeze = <T extends object>(object: T): T => {
  Object.values(object).forEach((value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value)
    }
  })
  return Object.freeze(object)
}

test('applyMutations() does not mutate its argument, even deeply', () => {
  const inlineConfig = {
    build: { command: 'one', environment: { NAME: 'one' } },
    functions: { '*': { included_files: ['a'] } },
    dev: { processing: { html: { injections: [] } } },
  }
  const copy = structuredClone(inlineConfig)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `applyMutations`'s result is untyped until its rewrite
  const result = applyMutations(deepFreeze(inlineConfig), [
    { keys: ['build', 'environment', 'NAME'], value: 'two', event: 'onPreBuild' },
    { keys: ['functions', 'node_bundler'], value: 'esbuild', event: 'onBuild' },
    { keys: ['dev', 'processing', 'html', 'injections'], value: [{ html: '<p>' }], event: 'onDev' },
  ])

  expect(inlineConfig).toEqual(copy)
  expect(result).toEqual({
    build: { command: 'one', environment: { NAME: 'two' } },
    functions: { '*': { included_files: ['a'], node_bundler: 'esbuild' } },
    dev: { processing: { html: { injections: [{ html: '<p>' }] } } },
  })
})

let buildDir: string

beforeEach(async () => {
  buildDir = await mkdtemp(join(tmpdir(), 'netlify-config-'))
})

afterEach(async () => {
  await rm(buildDir, { recursive: true, force: true })
})

const writeSiteFiles = async (files: Record<string, string>) => {
  await Promise.all(Object.entries(files).map(([name, content]) => writeFile(join(buildDir, name), content)))
  return {
    buildDir,
    configPath: join(buildDir, 'netlify.toml'),
    headersPath: join(buildDir, '_headers'),
    redirectsPath: join(buildDir, '_redirects'),
  }
}

const COMMAND_MUTATION = { keys: ['build', 'command'], value: 'npm test', event: 'onPreBuild' }
const CONTEXT = { context: 'production', branch: 'main' }

test('updateConfig() writes the mutations to netlify.toml, over the context and branch properties', async () => {
  const paths = await writeSiteFiles({})
  const headersMutation = {
    keys: ['headers'],
    value: [{ for: '/path', values: { 'X-Test': 'one' } }],
    event: 'onPostBuild',
  }

  // @ts-expect-error: `updateConfig`'s types, inferred from JavaScript, require `logs` and `featureFlags`
  await updateConfig([COMMAND_MUTATION, headersMutation], { ...paths, ...CONTEXT })

  // Current behaviour: each context entry repeats the build properties both at its top level and under build.
  expect(await readFile(paths.configPath, 'utf8')).toBe(`[build]
command = "npm test"

[[headers]]
for = "/path"

  [headers.values]
  X-Test = "one"

[context]

  [context.production]
  command = "npm test"

    [context.production.build]
    command = "npm test"

    [[context.production.headers]]
    for = "/path"

      [context.production.headers.values]
      X-Test = "one"

  [context.main]
  command = "npm test"

    [context.main.build]
    command = "npm test"

    [[context.main.headers]]
    for = "/path"

      [context.main.headers.values]
      X-Test = "one"`)
})

test('updateConfig() accepts and ignores unknown options such as featureFlags', async () => {
  const paths = await writeSiteFiles({})
  // @ts-expect-error: `updateConfig`'s types, inferred from JavaScript, require `logs` and `featureFlags`
  await updateConfig([COMMAND_MUTATION], { ...paths, ...CONTEXT })
  const withoutFeatureFlags = await readFile(paths.configPath, 'utf8')
  await rm(paths.configPath)

  const optionsWithFeatureFlags = { ...paths, ...CONTEXT, featureFlags: { some_flag: true } }
  // @ts-expect-error: `updateConfig`'s types, inferred from JavaScript, require `logs`
  await updateConfig([COMMAND_MUTATION], optionsWithFeatureFlags)

  expect(await readFile(paths.configPath, 'utf8')).toBe(withoutFeatureFlags)
})

test('updateConfig() backs up the site files under fixed names, whatever they are called', async () => {
  const originals = {
    'custom.toml': '[build]\ncommand = "npm run build"\n',
    custom_headers: '/path\n  X-Test: one\n',
    custom_redirects: '/one /two\n',
  }
  await writeSiteFiles(originals)
  const paths = {
    buildDir,
    configPath: join(buildDir, 'custom.toml'),
    headersPath: join(buildDir, 'custom_headers'),
    redirectsPath: join(buildDir, 'custom_redirects'),
  }

  // @ts-expect-error: `updateConfig`'s types, inferred from JavaScript, require `logs` and `featureFlags`
  await updateConfig([COMMAND_MUTATION], { ...paths, ...CONTEXT })

  const backupDir = join(buildDir, '.netlify', 'deploy')
  expect((await readdir(backupDir)).toSorted()).toEqual(['_headers', '_redirects', 'netlify.toml'])
  expect(await readFile(join(backupDir, 'netlify.toml'), 'utf8')).toBe(originals['custom.toml'])
  expect(await readFile(join(backupDir, '_headers'), 'utf8')).toBe(originals.custom_headers)
  expect(await readFile(join(backupDir, '_redirects'), 'utf8')).toBe(originals.custom_redirects)

  await restoreConfig([COMMAND_MUTATION], paths)

  expect(await readFile(paths.configPath, 'utf8')).toBe(originals['custom.toml'])
  expect(await readFile(paths.headersPath, 'utf8')).toBe(originals.custom_headers)
  expect(await readFile(paths.redirectsPath, 'utf8')).toBe(originals.custom_redirects)
})
