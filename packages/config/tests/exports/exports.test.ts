import { existsSync } from 'fs'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

import {
  DEV_EVENTS,
  EVENTS,
  applyMutations,
  cleanupConfig,
  mergeConfigs,
  restoreConfig,
  updateConfig,
} from '@netlify/config'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

test('EVENTS and DEV_EVENTS list the build events in order', () => {
  expect(EVENTS).toMatchInlineSnapshot(`
    [
      "onPreBuild",
      "onBuild",
      "onPostBuild",
      "onSuccess",
      "onError",
      "onEnd",
    ]
  `)
  expect(DEV_EVENTS).toMatchInlineSnapshot(`
    [
      "onPreDev",
      "onDev",
    ]
  `)
})

test('mergeConfigs() deep-merges objects, later configs taking priority', () => {
  expect(
    mergeConfigs([
      { build: { command: 'one', publish: 'dist' }, functions: { '*': { node_bundler: 'esbuild' } } },
      { build: { command: 'two' }, functions: { api: { included_files: ['a'] } } },
    ]),
  ).toEqual({
    build: { command: 'two', publish: 'dist' },
    functions: { '*': { node_bundler: 'esbuild' }, api: { included_files: ['a'] } },
  })
})

test('mergeConfigs() ignores undefined values, including those in build', () => {
  expect(
    mergeConfigs([
      { build: { command: 'one' }, redirects: [] },
      { build: { command: undefined }, redirects: undefined },
    ]),
  ).toEqual({ build: { command: 'one' }, redirects: [] })
})

test('mergeConfigs() replaces arrays by default', () => {
  expect(mergeConfigs([{ redirects: [{ from: '/a' }] }, { redirects: [{ from: '/b' }] }])).toEqual({
    build: {},
    redirects: [{ from: '/b' }],
  })
})

test('mergeConfigs() concatenates arrays with concatenateArrays, later configs first', () => {
  expect(
    mergeConfigs([{ redirects: [{ from: '/a' }] }, { redirects: [{ from: '/b' }] }], { concatenateArrays: true }),
  ).toEqual({ build: {}, redirects: [{ from: '/b' }, { from: '/a' }] })
})

test('mergeConfigs() merges plugins by package', () => {
  expect(
    mergeConfigs([
      { plugins: [{ package: 'one', inputs: { a: 1 } }, { package: 'two' }] },
      { plugins: [{ package: 'one', inputs: { b: 2 } }, { package: 'three' }] },
    ]),
  ).toMatchInlineSnapshot(`
    {
      "build": {},
      "plugins": [
        {
          "inputs": {
            "a": 1,
            "b": 2,
          },
          "package": "one",
        },
        {
          "package": "two",
        },
        {
          "package": "three",
        },
      ],
    }
  `)
})

test('cleanupConfig() keeps only properties that are safe to print', () => {
  expect(
    cleanupConfig({
      build: {
        base: '/repo',
        command: 'npm run build',
        commandOrigin: 'config',
        environment: { SECRET_TOKEN: 'secret', BRANCH: 'main', URL: 'https://example.com', CUSTOM: 'value' },
        edge_functions: '/repo/netlify/edge-functions',
        ignore: 'false',
        processing: { css: { bundle: true } },
        publish: '/repo/dist',
        publishOrigin: 'default',
        services: { secretService: 'secret' },
      },
      plugins: [{ package: 'plugin', origin: 'config', inputs: { enabled: true, apiKey: 'secret', count: 3 } }],
      functions: { '*': { node_bundler: 'esbuild' } },
      functionsDirectory: '/repo/netlify/functions',
      baseRelDir: true,
      headers: [],
      redirects: [],
      images: { remote_images: ['https://example.com/*'] },
    }),
  ).toMatchInlineSnapshot(`
    {
      "baseRelDir": true,
      "build": {
        "base": "/repo",
        "command": "npm run build",
        "commandOrigin": "config",
        "edge_functions": "/repo/netlify/edge-functions",
        "environment": [
          "SECRET_TOKEN",
          "CUSTOM",
        ],
        "ignore": "false",
        "processing": {
          "css": {
            "bundle": true,
          },
        },
        "publish": "/repo/dist",
        "publishOrigin": "default",
      },
      "functions": {
        "*": {
          "node_bundler": "esbuild",
        },
      },
      "functionsDirectory": "/repo/netlify/functions",
      "plugins": [
        {
          "inputs": {
            "enabled": true,
          },
          "origin": "config",
          "package": "plugin",
        },
      ],
    }
  `)
})

test('cleanupConfig() truncates headers and redirects to 100 entries', () => {
  const redirects = Array.from({ length: 150 }, (_, index) => ({ from: `/${String(index)}`, to: '/to', status: 301 }))
  const headers = Array.from({ length: 150 }, (_, index) => ({ for: `/${String(index)}`, values: { a: 'b' } }))

  const cleaned = cleanupConfig({ redirects, headers }) as { redirects: unknown[]; headers: unknown[] }

  expect(cleaned.redirects).toHaveLength(100)
  expect(cleaned.headers).toHaveLength(100)
  expect(cleaned.redirects[99]).toMatchObject({ from: '/99' })
})

test('applyMutations() sets properties', () => {
  expect(
    applyMutations({ build: { publish: 'dist' } }, [
      { keys: ['build', 'command'], value: 'npm test', event: 'onPreBuild' },
      { keys: ['redirects'], value: [{ from: '/a', to: '/b' }], event: 'onBuild' },
      { keys: ['build', 'environment', 'NAME'], value: 'value', event: 'onPostBuild' },
    ]),
  ).toMatchInlineSnapshot(`
    {
      "build": {
        "command": "npm test",
        "environment": {
          "NAME": "value",
        },
        "publish": "dist",
      },
      "redirects": [
        {
          "from": "/a",
          "to": "/b",
        },
      ],
    }
  `)
})

test('applyMutations() only allows replacing arrays as a whole', () => {
  expect(() => {
    applyMutations({}, [{ keys: ['edge_functions', 1], value: { path: '/two', function: 'two' }, event: 'onBuild' }])
  }).toThrow('"netlifyConfig.edge_functions.*" is read-only.')
})

test('applyMutations() applies top-level functions properties to all functions', () => {
  expect(
    applyMutations({ functions: { '*': { included_files: ['a'] } } }, [
      { keys: ['functions', 'node_bundler'], value: 'esbuild', event: 'onBuild' },
      { keys: ['functions', 'api'], value: { included_files: ['b'] }, event: 'onBuild' },
      { keys: ['functions', 'api', 'external_node_modules'], value: ['c'], event: 'onBuild' },
    ]),
  ).toMatchInlineSnapshot(`
    {
      "functions": {
        "*": {
          "included_files": [
            "a",
          ],
          "node_bundler": "esbuild",
        },
        "api": {
          "external_node_modules": [
            "c",
          ],
          "included_files": [
            "b",
          ],
        },
      },
    }
  `)
})

test('applyMutations() rejects mutations made after the last event allowed for the property', () => {
  expect(() => {
    applyMutations({}, [{ keys: ['build', 'command'], value: 'npm test', event: 'onBuild' }])
  }).toThrow('"netlifyConfig.build.command" cannot be modified after "onPreBuild".')
})

test('applyMutations() does not mutate its argument', () => {
  const inlineConfig = { build: { command: 'one' } }
  applyMutations(inlineConfig, [{ keys: ['build', 'command'], value: 'two', event: 'onPreBuild' }])
  expect(inlineConfig).toEqual({ build: { command: 'one' } })
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

test('updateConfig() backs up the site files, and restoreConfig() puts them back', async () => {
  const originals = {
    'netlify.toml': '[build]\ncommand = "npm run build"\n',
    _headers: '/path\n  X-Test: one\n',
    _redirects: '/one /two\n',
  }
  const paths = await writeSiteFiles(originals)

  // @ts-expect-error: `updateConfig`'s types, inferred from JavaScript, require `logs` and `featureFlags`
  await updateConfig([COMMAND_MUTATION], { ...paths, ...CONTEXT })

  expect(await readFile(paths.configPath, 'utf8')).toContain('npm test')
  expect(existsSync(paths.headersPath)).toBe(false)
  expect(existsSync(paths.redirectsPath)).toBe(false)
  expect(await readFile(join(buildDir, '.netlify/deploy/netlify.toml'), 'utf8')).toBe(originals['netlify.toml'])
  expect(await readFile(join(buildDir, '.netlify/deploy/_headers'), 'utf8')).toBe(originals._headers)
  expect(await readFile(join(buildDir, '.netlify/deploy/_redirects'), 'utf8')).toBe(originals._redirects)

  await restoreConfig([COMMAND_MUTATION], paths)

  expect(await readFile(paths.configPath, 'utf8')).toBe(originals['netlify.toml'])
  expect(await readFile(paths.headersPath, 'utf8')).toBe(originals._headers)
  expect(await readFile(paths.redirectsPath, 'utf8')).toBe(originals._redirects)
})

test('restoreConfig() deletes files that did not exist before updateConfig()', async () => {
  const paths = await writeSiteFiles({})

  // @ts-expect-error: `updateConfig`'s types, inferred from JavaScript, require `logs` and `featureFlags`
  await updateConfig([COMMAND_MUTATION], { ...paths, ...CONTEXT })
  expect(existsSync(paths.configPath)).toBe(true)

  await restoreConfig([COMMAND_MUTATION], paths)
  expect(existsSync(paths.configPath)).toBe(false)
})

test('restoreConfig() does nothing without config mutations', async () => {
  const paths = await writeSiteFiles({ 'netlify.toml': '[build]\ncommand = "changed"\n' })

  await restoreConfig([], paths)

  expect(await readFile(paths.configPath, 'utf8')).toBe('[build]\ncommand = "changed"\n')
})

test('updateConfig() flushes pending output before printing warnings', async () => {
  const paths = await writeSiteFiles({ _redirects: 'not a valid redirect line\n' })
  const stderrLengthsAtFlush: number[] = []
  const flush = vi.fn(() => stderrLengthsAtFlush.push(logs.stderr.length))
  const logs = { stdout: [] as string[], stderr: [] as string[], outputFlusher: { flush } }

  // @ts-expect-error: `updateConfig`'s types, inferred from JavaScript, require `featureFlags`
  await updateConfig([COMMAND_MUTATION], { ...paths, ...CONTEXT, logs })

  expect(logs.stderr.join('\n')).toContain('Warning: some redirects have syntax errors')
  expect(stderrLengthsAtFlush[0]).toBe(0)
})
