import { promises as fs, existsSync } from 'fs'
import { join, resolve } from 'path'
import { arch, kill, platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, startServer, removeDir } from '@netlify/testing'
import type { Manifest } from '@netlify/zip-it-and-ship-it'
import getNode from 'get-node'
import { memoize } from 'micro-memoize'
import { tmpName } from 'tmp-promise'
import { assert, expect, test, vi } from 'vitest'

import { zipItAndShipIt } from '../../lib/plugins_core/functions/index.js'
import { importJsonFile } from '../../lib/utils/json.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const CHILD_NODE_VERSION = '12.19.0'
const VERY_OLD_NODE_VERSION = '4.0.0'

// Try `get-node` several times because it sometimes fails due to network failures
const getNodeBinary = async function (nodeVersion: string, retries = 1): ReturnType<typeof getNode> {
  try {
    return await getNode(nodeVersion, {
      // there is no old node version for arm64 and MacOSX
      // just override it to always use x64 as it does not actually uses it.
      ...(platform === 'darwin' && arch === 'arm64' ? { arch: 'x64' } : {}),
    })
  } catch (error) {
    if (retries < 10) {
      return getNodeBinary(nodeVersion, retries + 1)
    }

    throw error
  }
}

const mGetNode = memoize(getNodeBinary, { async: true, maxSize: 1e3 })

test('--help', async () => {
  const { output } = await new Fixture().withFlags({ help: true }).runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--version', async () => {
  const { output } = await new Fixture().withFlags({ version: true }).runBuildBinary(FIXTURES_DIR)
  expect(output).not.toBe('0.0.0')
  expect(output).toMatch(/^\d+\.\d+\.\d+/)
})

test('Exit code is 0 on success', async () => {
  const { exitCode } = await new Fixture(import.meta.url, './fixtures/empty').runBuildBinary()
  expect(exitCode).toBe(0)
})

test('Event handlers are called', async () => {
  let flag = false
  let handlerArgs: { constants?: unknown; utils?: unknown } | undefined
  const { success } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({
      eventHandlers: {
        onPostBuild: (args: { constants?: unknown; utils?: unknown }) => {
          flag = true
          handlerArgs = args

          return {}
        },
      },
    })
    .runBuildProgrammatic()

  expect(success).toBe(true)
  expect(flag).toBe(true)
  expect(handlerArgs?.constants).toBeDefined()
  expect(handlerArgs?.utils).toBeDefined()
})

test('Event handlers with description are called', async () => {
  let flag = false
  const { success } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({
      eventHandlers: {
        onPostBuild: {
          handler: () => {
            flag = true

            return {}
          },
          description: 'Test onPostBuild',
        },
      },
    })
    .runBuildProgrammatic()

  expect(success).toBe(true)
  expect(flag).toBe(true)
})

test('Event handlers do not displace plugin methods', async () => {
  let flag = false
  const { success, configMutations } = await new Fixture(import.meta.url, './fixtures/plugin_mutations')
    .withFlags({
      eventHandlers: {
        onPreBuild: {
          handler: () => {
            flag = true

            return {}
          },
          description: 'Test onPreBuild',
        },
      },
    })
    .runBuildProgrammatic()

  expect(configMutations).toEqual([
    {
      keys: ['redirects'],
      keysString: 'redirects',
      value: [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }],
      event: 'onPreBuild',
    },
  ])
  expect(flag).toBe(true)
  expect(success).toBe(true)
})

test('Exit code is 1 on build cancellation', async () => {
  const { exitCode } = await new Fixture(import.meta.url, './fixtures/cancel').runBuildBinary()
  expect(exitCode).toBe(1)
})

test('Exit code is 2 on user error', async () => {
  const { exitCode } = await new Fixture().withFlags({ config: '/invalid' }).runBuildBinary()
  expect(exitCode).toBe(2)
})

test('Exit code is 3 on plugin error', async () => {
  const { exitCode } = await new Fixture(import.meta.url, './fixtures/plugin_error').runBuildBinary()
  expect(exitCode).toBe(3)
})

test('Success is true on success', async () => {
  const { success } = await new Fixture(import.meta.url, './fixtures/empty').runBuildProgrammatic()
  expect(success).toBe(true)
})

test('Success is false on build cancellation', async () => {
  const { success } = await new Fixture(import.meta.url, './fixtures/cancel').runBuildProgrammatic()
  expect(success).toBe(false)
})

test('Success is false on failure', async () => {
  const { success } = await new Fixture(import.meta.url, './fixtures/plugin_error').runBuildProgrammatic()
  expect(success).toBe(false)
})

test('severityCode is 0 on success', async () => {
  const { severityCode } = await new Fixture(import.meta.url, './fixtures/empty').runBuildProgrammatic()
  expect(severityCode).toBe(0)
})

test('severityCode is 1 on build cancellation', async () => {
  const { severityCode } = await new Fixture(import.meta.url, './fixtures/cancel').runBuildProgrammatic()
  expect(severityCode).toBe(1)
})

test('severityCode is 2 on user error', async () => {
  const { severityCode } = await new Fixture().withFlags({ config: '/invalid' }).runBuildProgrammatic()
  expect(severityCode).toBe(2)
})

test('severityCode is 3 on plugin error', async () => {
  const { severityCode } = await new Fixture(import.meta.url, './fixtures/plugin_error').runBuildProgrammatic()
  expect(severityCode).toBe(3)
})

test('returns config mutations', async () => {
  const { configMutations } = await new Fixture(import.meta.url, './fixtures/plugin_mutations').runBuildProgrammatic()

  expect(configMutations).toEqual([
    {
      keys: ['redirects'],
      keysString: 'redirects',
      value: [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }],
      event: 'onPreBuild',
    },
  ])
})

test('--cwd', async () => {
  const output = await new Fixture().withFlags({ cwd: `${FIXTURES_DIR}/publish` }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--repository-root', async () => {
  const output = await new Fixture().withFlags({ repositoryRoot: `${FIXTURES_DIR}/empty` }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--config', async () => {
  const output = await new Fixture().withFlags({ config: `${FIXTURES_DIR}/empty/netlify.toml` }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('nested --config', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/toml')
    .withFlags({ config: `${FIXTURES_DIR}/toml/apps/nested/netlify.toml` })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('empty --config', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/toml')
    .withFlags({ config: '', cwd: `${FIXTURES_DIR}/toml/apps/nested` })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig CLI flag', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({
      defaultConfig: JSON.stringify({ build: { command: 'echo commandDefault' } }),
    })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({
      defaultConfig: { build: { command: 'echo commandDefault' } },
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cachedConfig CLI flag', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfig()
  const { output } = await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({ cachedConfig })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cachedConfigPath CLI flag', async () => {
  const cachedConfigPath = await tmpName()
  try {
    await new Fixture(import.meta.url, './fixtures/cached_config')
      .withFlags({ output: cachedConfigPath })
      .runConfigBinary()
    const { output } = await new Fixture(import.meta.url, './fixtures/cached_config')
      .withFlags({ cachedConfigPath, context: 'test' })
      .runBuildBinary()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--cachedConfig', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()
  const output = await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({ cachedConfig })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cachedConfigPath', async () => {
  const cachedConfigPath = await tmpName()
  try {
    const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfig()
    await fs.writeFile(cachedConfigPath, cachedConfig)
    const output = await new Fixture(import.meta.url, './fixtures/cached_config')
      .withFlags({ cachedConfigPath, context: 'test' })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--context', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/context')
    .withFlags({ context: 'testContext' })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--branch', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/context')
    .withFlags({ branch: 'testContext' })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--baseRelDir', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/basereldir')
    .withFlags({ baseRelDir: false })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('User error', async () => {
  const output = await new Fixture().withFlags({ config: '/invalid' }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('No configuration file', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/none').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--dry with one event', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/single').withFlags({ dry: true }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--dry with several events', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/several').withFlags({ dry: true }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--dry-run', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/single')
    .withFlags({ dryRun: true })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--dry with build.command but no netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/none')
    .withFlags({ dry: true, defaultConfig: { build: { command: 'echo' } } })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--node-path is used by build.command', async () => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  const output = await new Fixture(import.meta.url, './fixtures/build_command')
    .withFlags({ nodePath: path })
    .withEnv({ TEST_NODE_PATH: path })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--node-path is not used by local plugins', async () => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  const output = await new Fixture(import.meta.url, './fixtures/local_node_path_unused')
    .withFlags({ nodePath: path })
    .withEnv({ TEST_NODE_PATH: path })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--node-path is not used by plugins added to package.json', async () => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  const output = await new Fixture(import.meta.url, './fixtures/package_node_path_unused')
    .withFlags({ nodePath: path })
    .withEnv({ TEST_NODE_PATH: path })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--node-path is not used by core plugins', async () => {
  const { path } = await mGetNode(VERY_OLD_NODE_VERSION)
  const output = await new Fixture(import.meta.url, './fixtures/core').withFlags({ nodePath: path }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--skew-protection-token', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_echo_env')
    .withFlags({ skewProtectionToken: 'foobar' })
    .runWithBuild()

  expect(output).toContain(`"NETLIFY_SKEW_PROTECTION_TOKEN":"foobar"`)
})

test('featureFlags can be used programmatically', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('featureFlags can be used in the CLI', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runBuildBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('featureFlags can be not used', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ featureFlags: undefined })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

const runWithApiMock = async function (flags: Record<string, unknown> = {}) {
  const { scheme, host, requests, stopServer } = await startServer({ path: '/api/v1/deploys/test/cancel' })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/cancel')
      .withFlags({ apiHost: host, testOpts: { scheme }, ...flags })
      .runWithBuild()
    return { output, requests }
  } finally {
    await stopServer()
  }
}

test('--apiHost is used to set Netlify API host', async () => {
  const { output, requests } = await runWithApiMock({ token: 'test', deployId: 'test' })
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(requests).toHaveLength(1)
  expect(requests).toMatchSnapshot()
})

test('Print warning when redirects file is missing from publish directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing_redirects_warning').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not print warning when redirects file is not missing from publish directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing_redirects_present').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not print warning when redirects file is missing from the build directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing_redirects_absent').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not print warning when redirects file is missing both from the build directory and the publish directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing_redirects_none').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Print warning for missing redirects file even with a base directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing_redirects_base').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Print warning when headers file is missing from publish directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing_headers_warning').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Passes the right properties to zip-it-and-ship-it', async () => {
  const mockZipFunctions = vi.spyOn(zipItAndShipIt, 'zipFunctions').mockResolvedValue([])
  const fixtureDir = join(FIXTURES_DIR, 'core')

  await new Fixture(import.meta.url, './fixtures/core').runWithBuild()
  await new Fixture(import.meta.url, './fixtures/core')
    .withFlags({ mode: 'buildbot' })
    .withEnv({ AWS_LAMBDA_JS_RUNTIME: 'nodejs00.x' })
    .runWithBuild()

  expect(mockZipFunctions).toHaveBeenCalledTimes(2)

  const params1 = mockZipFunctions.mock.calls[0][2]
  assert.isDefined(params1)

  expect(params1.basePath).toBe(fixtureDir)
  expect(params1.config?.['*'].zipGo).toBe(true)
  expect(params1.config?.['*'].includedFilesBasePath).toBe(fixtureDir)
  expect(params1.repositoryRoot).toBe(fixtureDir)

  expect(params1.config?.['*'].nodeVersion).toBe(process.versions.node)

  const params2 = mockZipFunctions.mock.calls[1][2]
  assert.isDefined(params2)

  expect(params2.config?.['*'].nodeVersion).toBe('nodejs00.x')
  expect(params2.config?.['*'].zipGo).toBe(undefined)
})

test('Passes functions generated by build plugins to zip-it-and-ship-it', async () => {
  const mockZipFunctions = vi.spyOn(zipItAndShipIt, 'zipFunctions').mockResolvedValue([])
  const fixtureName = 'functions_generated_from_steps'
  const fixtureDir = join(FIXTURES_DIR, fixtureName)

  const { success, generatedFunctions } = await new Fixture(import.meta.url, `./fixtures/${fixtureName}`)
    .withFlags({ mode: 'buildbot' })
    .runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(mockZipFunctions).toHaveBeenCalledTimes(1)

  const [paths] = mockZipFunctions.mock.calls[0]

  expect(paths).toEqual({
    generated: {
      directories: [resolve(fixtureDir, '.netlify/functions-internal'), resolve(fixtureDir, '.netlify/v1/functions')],
      functions: [resolve(fixtureDir, '.netlify/plugins/node_modules/plugin/functions/plugin-func1.mjs')],
    },
    user: {
      directories: [resolve(fixtureDir, 'netlify/functions')],
    },
  })

  assert.isDefined(generatedFunctions)
  expect(generatedFunctions).toHaveLength(1)
  expect(generatedFunctions[0].generator).toEqual({
    displayName: './.netlify/plugins/node_modules/plugin/plugin.mjs',
    name: './.netlify/plugins/node_modules/plugin/plugin.mjs',
    type: 'build plugin',
  })
  expect(generatedFunctions[0].path).toBe(
    join(fixtureDir, '.netlify/plugins/node_modules/plugin/functions/plugin-func1.mjs'),
  )
})

test('Passes the right feature flags to zip-it-and-ship-it', async () => {
  const mockZipFunctions = vi.spyOn(zipItAndShipIt, 'zipFunctions').mockResolvedValue([])

  await new Fixture(import.meta.url, './fixtures/schedule').runWithBuild()
  await new Fixture(import.meta.url, './fixtures/schedule')
    .withFlags({ featureFlags: { buildbot_zisi_trace_nft: true } })
    .runWithBuild()
  await new Fixture(import.meta.url, './fixtures/schedule')
    .withFlags({ featureFlags: { this_is_a_mock_flag: true, and_another_one: true } })
    .runWithBuild()

  expect(mockZipFunctions).toHaveBeenCalledTimes(3)

  const [, , options1] = mockZipFunctions.mock.calls[0]
  const [, , options2] = mockZipFunctions.mock.calls[1]
  const [, , options3] = mockZipFunctions.mock.calls[2]

  expect(options1?.featureFlags?.traceWithNft).toBe(false)
  expect(options1?.config?.test.schedule).toBe('@daily')
  expect(options1?.featureFlags).not.toHaveProperty('this_is_a_mock_flag')
  expect(options1?.featureFlags).not.toHaveProperty('and_another_one')

  expect(options2?.featureFlags?.traceWithNft).toBe(true)
  expect(options3?.featureFlags).toHaveProperty('this_is_a_mock_flag', true)
  expect(options3?.featureFlags).toHaveProperty('and_another_one', true)
})

test('Print warning on lingering processes', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/lingering')
    .withFlags({ testOpts: { silentLingeringProcesses: false }, mode: 'buildbot' })
    .runWithBuild()

  // Cleanup the lingering process
  const pid = PID_LINE_REGEXP.exec(output)?.[1]
  assert.isDefined(pid)
  kill(Number(pid))

  expect(output).toContain('the following processes were still running')
  expect(output).toContain(platform === 'win32' ? 'node.exe' : 'forever.js')
})

const PID_LINE_REGEXP = /^PID: (\d+)$/m

test('Functions config is passed to zip-it-and-ship-it (1)', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_config_1').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions config is passed to zip-it-and-ship-it (2)', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_config_2').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions config is passed to zip-it-and-ship-it (3)', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_config_3').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Shows notice about bundling errors and warnings coming from esbuild', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/esbuild_errors_1').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Shows notice about bundling errors and falls back to ZISI', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/esbuild_errors_2').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Bundles functions from the `.netlify/functions-internal` directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_internal').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not require the `.netlify/functions-internal` directory to exist', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_internal_missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not require the `.netlify/functions-internal` or the user functions directory to exist', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_internal_user_missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Bundles functions from the `.netlify/functions-internal` directory even if the configured user functions directory is missing', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_user_missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Removes duplicate function names from the list of processed functions', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_duplicate_names').runWithBuild()
  expect(normalizeOutput(output)).toContain(`- function_one.js`)
  expect(normalizeOutput(output)).not.toContain(`- function_one.ts`)
})

test('`rustTargetDirectory` is passed to zip-it-and-ship-it only when running in buildbot', async () => {
  const runCount = 4
  const mockZipFunctions = vi.spyOn(zipItAndShipIt, 'zipFunctions').mockResolvedValue([])

  await new Fixture(import.meta.url, './fixtures/functions_config_1').withFlags({ mode: 'buildbot' }).runWithBuild()
  await new Fixture(import.meta.url, './fixtures/functions_config_1').runWithBuild()
  await new Fixture(import.meta.url, './fixtures/functions_internal_missing')
    .withFlags({ mode: 'buildbot' })
    .runWithBuild()
  await new Fixture(import.meta.url, './fixtures/functions_internal_missing').runWithBuild()

  expect(mockZipFunctions).toHaveBeenCalledTimes(runCount)

  const [call1Args, call2Args, call3Args, call4Args] = mockZipFunctions.mock.calls

  expect(call1Args[2]?.config?.['*'].rustTargetDirectory).toBe(
    join(FIXTURES_DIR, 'functions_config_1', '.netlify', 'rust-functions-cache', '[name]'),
  )
  expect(call2Args[2]?.config?.['*'].rustTargetDirectory).toBe(undefined)
  expect(call3Args[2]?.config?.['*'].rustTargetDirectory).toBe(
    join(FIXTURES_DIR, 'functions_internal_missing', '.netlify', 'rust-functions-cache', '[name]'),
  )
  expect(call4Args[2]?.config?.['*'].rustTargetDirectory).toBe(undefined)
})

test('configFileDirectories is passed to zip-it-and-ship-it', async () => {
  const runCount = 1
  const mockZipFunctions = vi.spyOn(zipItAndShipIt, 'zipFunctions').mockResolvedValue([])

  await new Fixture(import.meta.url, './fixtures/functions_config_json').withFlags({ mode: 'buildbot' }).runWithBuild()

  expect(mockZipFunctions).toHaveBeenCalledTimes(runCount)

  const call1Args = mockZipFunctions.mock.calls[0]

  expect(call1Args[2]?.configFileDirectories).toEqual([
    join(FIXTURES_DIR, 'functions_config_json/.netlify/functions-internal'),
  ])
})

test('functions can have a config with different parameters passed to zip-it-and-ship-it', async () => {
  const zipItAndShipItSpy = vi.spyOn(zipItAndShipIt, 'zipFunctions')
  const output = await new Fixture(import.meta.url, './fixtures/functions_config_json')
    .withFlags({
      mode: 'buildbot',
    })
    .runWithBuild()

  const call1Args = zipItAndShipItSpy.mock.calls[0]
  const manifestPath = call1Args[2]?.manifest
  assert.isDefined(manifestPath)
  const { functions } = await importJsonFile<Manifest>(manifestPath)

  expect(functions[0].displayName).toBe('Function One')
  expect(functions[0].generator).toBe('@netlify/mock-plugin@1.0.0')
  expect(functions[1].displayName).toBe(undefined)

  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('internalSrcFolder is passed to zip-it-and-ship-it and helps prefill the generator field', async () => {
  const zipItAndShipItSpy = vi.spyOn(zipItAndShipIt, 'zipFunctions')

  await new Fixture(import.meta.url, './fixtures/functions_internal_src_folder')
    .withFlags({ mode: 'buildbot' })
    .runWithBuild()
  const call1Args = zipItAndShipItSpy.mock.calls[0]

  const [paths, , options] = call1Args

  expect(paths).toEqual({
    generated: {
      directories: [
        join(FIXTURES_DIR, 'functions_internal_src_folder/.netlify/functions-internal'),
        join(FIXTURES_DIR, 'functions_internal_src_folder/.netlify/v1/functions'),
      ],
      functions: [],
    },
    user: {
      directories: [join(FIXTURES_DIR, 'functions_internal_src_folder/netlify/functions')],
    },
  })

  const manifestPath = options?.manifest
  assert.isDefined(manifestPath)
  const { functions } = await importJsonFile<Manifest>(manifestPath)

  expect(functions[0].generator).toBe('internalFunc')
  expect(functions[1].generator).toBe(undefined)
})

test('Generates a `manifest.json` file when running outside of buildbot', async () => {
  await removeDir(`${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions`)
  await new Fixture(import.meta.url, './fixtures/functions_internal_manifest').withFlags({ mode: 'cli' }).runWithBuild()
  const manifestPath = `${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions/manifest.json`

  expect(existsSync(manifestPath)).toBe(true)

  const { functions, timestamp, version: manifestVersion } = await importJsonFile<Manifest>(manifestPath)

  expect(functions).toHaveLength(3)
  expect(typeof timestamp).toBe('number')
  expect(manifestVersion).toBe(1)
})

test('Generates a `manifest.json` file when the `buildbot_create_functions_manifest` feature flag is set', async () => {
  await removeDir(`${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions`)

  await new Fixture(import.meta.url, './fixtures/functions_internal_manifest')
    .withFlags({ featureFlags: { buildbot_create_functions_manifest: true } })
    .runWithBuild()

  const manifestPath = `${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions/manifest.json`

  expect(existsSync(manifestPath)).toBe(true)

  const { functions, timestamp, version: manifestVersion } = await importJsonFile<Manifest>(manifestPath)

  expect(functions).toHaveLength(3)
  expect(typeof timestamp).toBe('number')
  expect(manifestVersion).toBe(1)
})
