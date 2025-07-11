import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { arch, kill, platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, startServer, removeDir } from '@netlify/testing'
import test from 'ava'
import getNode from 'get-node'
import moize from 'moize'
import { pathExists } from 'path-exists'
import semver from 'semver'
import sinon from 'sinon'
import { tmpName } from 'tmp-promise'

import { zipItAndShipIt } from '../../lib/plugins_core/functions/index.js'
import { importJsonFile } from '../../lib/utils/json.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const CHILD_NODE_VERSION = '12.19.0'
const VERY_OLD_NODE_VERSION = '4.0.0'

// Try `get-node` several times because it sometimes fails due to network failures
const getNodeBinary = async function (nodeVersion, retries = 1) {
  try {
    return await getNode(nodeVersion, {
      // there is no old node version for arm64 and MacOSX
      // just override it to always use x64 as it does not actually uses it.
      arch: platform === 'darwin' && arch === 'arm64' ? 'x64' : arch,
    })
  } catch (error) {
    if (retries < 10) {
      return getNodeBinary(nodeVersion, retries + 1)
    }

    throw error
  }
}

const mGetNode = moize(getNodeBinary, { isPromise: true, maxSize: 1e3 })

test('--help', async (t) => {
  const { output } = await new Fixture().withFlags({ help: true }).runBuildBinary()
  t.snapshot(normalizeOutput(output))
})

test('--version', async (t) => {
  const { output } = await new Fixture().withFlags({ version: true }).runBuildBinary(FIXTURES_DIR)
  t.not(output, '0.0.0')
  t.regex(output, /^\d+\.\d+\.\d+/)
})

test('Exit code is 0 on success', async (t) => {
  const { exitCode } = await new Fixture('./fixtures/empty').runBuildBinary()
  t.is(exitCode, 0)
})

test('Event handlers are called', async (t) => {
  let flag = false
  let handlerArgs = undefined
  const { success } = await new Fixture('./fixtures/empty')
    .withFlags({
      eventHandlers: {
        onPostBuild: (args) => {
          flag = true
          handlerArgs = args

          return {}
        },
      },
    })
    .runBuildProgrammatic()

  t.true(success)
  t.true(flag)
  t.true(handlerArgs?.constants !== undefined)
  t.true(handlerArgs?.utils !== undefined)
})

test('Event handlers with description are called', async (t) => {
  let flag = false
  const { success } = await new Fixture('./fixtures/empty')
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

  t.true(success)
  t.true(flag)
})

test('Event handlers do not displace plugin methods', async (t) => {
  let flag = false
  const { success, configMutations } = await new Fixture('./fixtures/plugin_mutations')
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

  t.deepEqual(configMutations, [
    {
      keys: ['redirects'],
      keysString: 'redirects',
      value: [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }],
      event: 'onPreBuild',
    },
  ])
  t.true(flag)
  t.true(success)
})

test('Exit code is 1 on build cancellation', async (t) => {
  const { exitCode } = await new Fixture('./fixtures/cancel').runBuildBinary()
  t.is(exitCode, 1)
})

test('Exit code is 2 on user error', async (t) => {
  const { exitCode } = await new Fixture().withFlags({ config: '/invalid' }).runBuildBinary()
  t.is(exitCode, 2)
})

test('Exit code is 3 on plugin error', async (t) => {
  const { exitCode } = await new Fixture('./fixtures/plugin_error').runBuildBinary()
  t.is(exitCode, 3)
})

test('Success is true on success', async (t) => {
  const { success } = await new Fixture('./fixtures/empty').runBuildProgrammatic()
  t.true(success)
})

test('Success is false on build cancellation', async (t) => {
  const { success } = await new Fixture('./fixtures/cancel').runBuildProgrammatic()
  t.false(success)
})

test('Success is false on failure', async (t) => {
  const { success } = await new Fixture('./fixtures/plugin_error').runBuildProgrammatic()
  t.false(success)
})

test('severityCode is 0 on success', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/empty').runBuildProgrammatic()
  t.is(severityCode, 0)
})

test('severityCode is 1 on build cancellation', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/cancel').runBuildProgrammatic()
  t.is(severityCode, 1)
})

test('severityCode is 2 on user error', async (t) => {
  const { severityCode } = await new Fixture().withFlags({ config: '/invalid' }).runBuildProgrammatic()
  t.is(severityCode, 2)
})

test('severityCode is 3 on plugin error', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/plugin_error').runBuildProgrammatic()
  t.is(severityCode, 3)
})

test('returns config mutations', async (t) => {
  const { configMutations } = await new Fixture('./fixtures/plugin_mutations').runBuildProgrammatic()

  t.deepEqual(configMutations, [
    {
      keys: ['redirects'],
      keysString: 'redirects',
      value: [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }],
      event: 'onPreBuild',
    },
  ])
})

test('--cwd', async (t) => {
  const output = await new Fixture().withFlags({ cwd: `${FIXTURES_DIR}/publish` }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--repository-root', async (t) => {
  const output = await new Fixture().withFlags({ repositoryRoot: `${FIXTURES_DIR}/empty` }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--config', async (t) => {
  const output = await new Fixture().withFlags({ config: `${FIXTURES_DIR}/empty/netlify.toml` }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('nested --config', async (t) => {
  const output = await new Fixture('./fixtures/toml')
    .withFlags({ config: `${FIXTURES_DIR}/toml/apps/nested/netlify.toml` })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('empty --config', async (t) => {
  const output = await new Fixture('./fixtures/toml')
    .withFlags({ config: '', cwd: `${FIXTURES_DIR}/toml/apps/nested` })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig CLI flag', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({
      defaultConfig: JSON.stringify({ build: { command: 'echo commandDefault' } }),
    })
    .runBuildBinary()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({
      defaultConfig: { build: { command: 'echo commandDefault' } },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--cachedConfig CLI flag', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfig()
  const { output } = await new Fixture('./fixtures/cached_config').withFlags({ cachedConfig }).runBuildBinary()
  t.snapshot(normalizeOutput(output))
})

test('--cachedConfigPath CLI flag', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    await new Fixture('./fixtures/cached_config').withFlags({ output: cachedConfigPath }).runConfigBinary()
    const { output } = await new Fixture('./fixtures/cached_config')
      .withFlags({ cachedConfigPath, context: 'test' })
      .runBuildBinary()
    t.snapshot(normalizeOutput(output))
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--cachedConfig', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfigAsObject()
  const output = await new Fixture('./fixtures/cached_config').withFlags({ cachedConfig }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--cachedConfigPath', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfig()
    await fs.writeFile(cachedConfigPath, cachedConfig)
    const output = await new Fixture('./fixtures/cached_config')
      .withFlags({ cachedConfigPath, context: 'test' })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--context', async (t) => {
  const output = await new Fixture('./fixtures/context').withFlags({ context: 'testContext' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--branch', async (t) => {
  const output = await new Fixture('./fixtures/context').withFlags({ branch: 'testContext' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--baseRelDir', async (t) => {
  const output = await new Fixture('./fixtures/basereldir').withFlags({ baseRelDir: false }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('User error', async (t) => {
  const output = await new Fixture().withFlags({ config: '/invalid' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('No configuration file', async (t) => {
  const output = await new Fixture('./fixtures/none').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--dry with one event', async (t) => {
  const output = await new Fixture('./fixtures/single').withFlags({ dry: true }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--dry with several events', async (t) => {
  const output = await new Fixture('./fixtures/several').withFlags({ dry: true }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--dry-run', async (t) => {
  const { output } = await new Fixture('./fixtures/single').withFlags({ dryRun: true }).runBuildBinary()
  t.snapshot(normalizeOutput(output))
})

test('--dry with build.command but no netlify.toml', async (t) => {
  const output = await new Fixture('./fixtures/none')
    .withFlags({ dry: true, defaultConfig: { build: { command: 'echo' } } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--node-path is used by build.command', async (t) => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  const output = await new Fixture('./fixtures/build_command')
    .withFlags({ nodePath: path })
    .withEnv({ TEST_NODE_PATH: path })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--node-path is not used by local plugins', async (t) => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  const output = await new Fixture('./fixtures/local_node_path_unused')
    .withFlags({ nodePath: path })
    .withEnv({ TEST_NODE_PATH: path })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--node-path is not used by plugins added to package.json', async (t) => {
  const { path } = await mGetNode(CHILD_NODE_VERSION)
  const output = await new Fixture('./fixtures/package_node_path_unused')
    .withFlags({ nodePath: path })
    .withEnv({ TEST_NODE_PATH: path })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('--node-path is not used by core plugins', async (t) => {
  const { path } = await mGetNode(VERY_OLD_NODE_VERSION)
  const output = await new Fixture('./fixtures/core').withFlags({ nodePath: path }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('featureFlags can be used programmatically', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('featureFlags can be used in the CLI', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runBuildBinary()
  t.snapshot(normalizeOutput(output))
})

test('featureFlags can be not used', async (t) => {
  const output = await new Fixture('./fixtures/empty').withFlags({ featureFlags: undefined }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

const runWithApiMock = async function (t, flags = {}) {
  const { scheme, host, requests, stopServer } = await startServer({ path: '/api/v1/deploys/test/cancel' })
  try {
    const output = await new Fixture('./fixtures/cancel')
      .withFlags({ apiHost: host, testOpts: { scheme }, ...flags })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
  return requests
}

test('--apiHost is used to set Netlify API host', async (t) => {
  const requests = await runWithApiMock(t, { token: 'test', deployId: 'test' })
  t.is(requests.length, 1)
  t.snapshot(requests)
})

test('Print warning when redirects file is missing from publish directory', async (t) => {
  const output = await new Fixture('./fixtures/missing_redirects_warning').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not print warning when redirects file is not missing from publish directory', async (t) => {
  const output = await new Fixture('./fixtures/missing_redirects_present').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not print warning when redirects file is missing from the build directory', async (t) => {
  const output = await new Fixture('./fixtures/missing_redirects_absent').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not print warning when redirects file is missing both from the build directory and the publish directory', async (t) => {
  const output = await new Fixture('./fixtures/missing_redirects_none').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Print warning for missing redirects file even with a base directory', async (t) => {
  const output = await new Fixture('./fixtures/missing_redirects_base').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Print warning when headers file is missing from publish directory', async (t) => {
  const output = await new Fixture('./fixtures/missing_headers_warning').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test.serial('Passes the right properties to zip-it-and-ship-it', async (t) => {
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)
  const fixtureDir = join(FIXTURES_DIR, 'core')

  await new Fixture('./fixtures/core').runWithBuild()
  await new Fixture('./fixtures/core')
    .withFlags({ mode: 'buildbot' })
    .withEnv({ AWS_LAMBDA_JS_RUNTIME: 'nodejs00.x' })
    .runWithBuild()

  stub.restore()

  t.is(mockZipFunctions.callCount, 2)

  const params1 = mockZipFunctions.firstCall.args[2]

  t.is(params1.basePath, fixtureDir)
  t.true(params1.config['*'].zipGo)
  t.is(params1.config['*'].includedFilesBasePath, fixtureDir)
  t.is(params1.repositoryRoot, fixtureDir)

  const testNodeVersion = process.versions.node
  if (semver.gte(testNodeVersion, '16.0.0')) {
    t.is(params1.config['*'].nodeVersion, testNodeVersion)
  } else {
    t.is(params1.config['*'].nodeVersion, undefined)
  }

  const params2 = mockZipFunctions.secondCall.args[2]

  t.is(params2.config['*'].nodeVersion, 'nodejs00.x')
  t.is(params2.config['*'].zipGo, undefined)
})

test.serial('Passes functions generated by build plugins to zip-it-and-ship-it', async (t) => {
  const mockZipFunctions = sinon.stub().resolves([])
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)
  const fixtureName = 'functions_generated_from_steps'
  const fixtureDir = join(FIXTURES_DIR, fixtureName)

  const { success, generatedFunctions } = await new Fixture(`./fixtures/${fixtureName}`)
    .withFlags({ mode: 'buildbot' })
    .runWithBuildAndIntrospect()

  stub.restore()

  t.true(success)
  t.is(mockZipFunctions.callCount, 1)

  const { generated, user } = mockZipFunctions.firstCall.args[0]

  t.is(generated.directories.length, 2)
  t.true(generated.directories.includes(resolve(fixtureDir, '.netlify/functions-internal')))
  t.true(generated.directories.includes(resolve(fixtureDir, '.netlify/v1/functions')))

  t.is(generated.functions.length, 1)
  t.true(
    generated.functions.includes(
      resolve(fixtureDir, '.netlify/plugins/node_modules/plugin/functions/plugin-func1.mjs'),
    ),
  )

  t.is(user.directories.length, 1)
  t.true(user.directories.includes(resolve(fixtureDir, 'netlify/functions')))
  t.is(user.functions, undefined)

  t.is(generatedFunctions.length, 1)
  t.deepEqual(generatedFunctions[0].generator, {
    displayName: './.netlify/plugins/node_modules/plugin/plugin.mjs',
    name: './.netlify/plugins/node_modules/plugin/plugin.mjs',
    type: 'build plugin',
  })
  t.is(generatedFunctions[0].path, join(fixtureDir, '.netlify/plugins/node_modules/plugin/functions/plugin-func1.mjs'))
})

test.serial('Passes the right feature flags to zip-it-and-ship-it', async (t) => {
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await new Fixture('./fixtures/schedule').runWithBuild()
  await new Fixture('./fixtures/schedule').withFlags({ featureFlags: { buildbot_zisi_trace_nft: true } }).runWithBuild()
  await new Fixture('./fixtures/schedule')
    .withFlags({ featureFlags: { buildbot_zisi_esbuild_parser: true } })
    .runWithBuild()
  await new Fixture('./fixtures/schedule')
    .withFlags({ featureFlags: { this_is_a_mock_flag: true, and_another_one: true } })
    .runWithBuild()

  stub.restore()

  t.is(mockZipFunctions.callCount, 4)

  t.false(mockZipFunctions.getCall(0).args[2].featureFlags.traceWithNft)
  t.false(mockZipFunctions.getCall(0).args[2].featureFlags.parseWithEsbuild)
  t.is(mockZipFunctions.getCall(0).args[2].config.test.schedule, '@daily')
  t.is(mockZipFunctions.getCall(0).args[2].featureFlags.this_is_a_mock_flag, undefined)
  t.is(mockZipFunctions.getCall(0).args[2].featureFlags.and_another_one, undefined)

  t.true(mockZipFunctions.getCall(1).args[2].featureFlags.traceWithNft)
  t.true(mockZipFunctions.getCall(2).args[2].featureFlags.parseWithEsbuild)
  t.true(mockZipFunctions.getCall(3).args[2].featureFlags.this_is_a_mock_flag)
  t.true(mockZipFunctions.getCall(3).args[2].featureFlags.and_another_one)
})

test('Print warning on lingering processes', async (t) => {
  const output = await new Fixture('./fixtures/lingering')
    .withFlags({ testOpts: { silentLingeringProcesses: false }, mode: 'buildbot' })
    .runWithBuild()

  // Cleanup the lingering process
  const [, pid] = PID_LINE_REGEXP.exec(output)
  kill(pid)

  t.true(output.includes('the following processes were still running'))
  t.true(output.includes(platform === 'win32' ? 'node.exe' : 'forever.js'))
})

const PID_LINE_REGEXP = /^PID: (\d+)$/m

test('Functions config is passed to zip-it-and-ship-it (1)', async (t) => {
  const output = await new Fixture('./fixtures/functions_config_1').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions config is passed to zip-it-and-ship-it (2)', async (t) => {
  const output = await new Fixture('./fixtures/functions_config_2').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions config is passed to zip-it-and-ship-it (3)', async (t) => {
  const output = await new Fixture('./fixtures/functions_config_3').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Shows notice about bundling errors and warnings coming from esbuild', async (t) => {
  const output = await new Fixture('./fixtures/esbuild_errors_1').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Shows notice about bundling errors and falls back to ZISI', async (t) => {
  const output = await new Fixture('./fixtures/esbuild_errors_2').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Bundles functions from the `.netlify/functions-internal` directory', async (t) => {
  const output = await new Fixture('./fixtures/functions_internal').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not require the `.netlify/functions-internal` directory to exist', async (t) => {
  const output = await new Fixture('./fixtures/functions_internal_missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not require the `.netlify/functions-internal` or the user functions directory to exist', async (t) => {
  const output = await new Fixture('./fixtures/functions_internal_user_missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Bundles functions from the `.netlify/functions-internal` directory even if the configured user functions directory is missing', async (t) => {
  const output = await new Fixture('./fixtures/functions_user_missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Removes duplicate function names from the list of processed functions', async (t) => {
  const output = await new Fixture('./fixtures/functions_duplicate_names').runWithBuild()
  t.true(normalizeOutput(output).includes(`- function_one.js`))
  t.false(normalizeOutput(output).includes(`- function_one.ts`))
})

test.serial('`rustTargetDirectory` is passed to zip-it-and-ship-it only when running in buildbot', async (t) => {
  const runCount = 4
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await new Fixture('./fixtures/functions_config_1').withFlags({ mode: 'buildbot' }).runWithBuild()
  await new Fixture('./fixtures/functions_config_1').runWithBuild()
  await new Fixture('./fixtures/functions_internal_missing').withFlags({ mode: 'buildbot' }).runWithBuild()
  await new Fixture('./fixtures/functions_internal_missing').runWithBuild()

  stub.restore()

  t.is(mockZipFunctions.callCount, runCount)

  const { args: call1Args } = mockZipFunctions.getCall(0)
  const { args: call2Args } = mockZipFunctions.getCall(1)
  const { args: call3Args } = mockZipFunctions.getCall(2)
  const { args: call4Args } = mockZipFunctions.getCall(3)

  t.is(
    call1Args[2].config['*'].rustTargetDirectory,
    join(FIXTURES_DIR, 'functions_config_1', '.netlify', 'rust-functions-cache', '[name]'),
  )
  t.is(call2Args[2].config['*'].rustTargetDirectory, undefined)
  t.is(
    call3Args[2].config['*'].rustTargetDirectory,
    join(FIXTURES_DIR, 'functions_internal_missing', '.netlify', 'rust-functions-cache', '[name]'),
  )
  t.is(call4Args[2].config['*'].rustTargetDirectory, undefined)
})

test.serial('configFileDirectories is passed to zip-it-and-ship-it', async (t) => {
  const runCount = 1
  const mockZipFunctions = sinon.stub().resolves()
  const stub = sinon.stub(zipItAndShipIt, 'zipFunctions').get(() => mockZipFunctions)

  await new Fixture('./fixtures/functions_config_json').withFlags({ mode: 'buildbot' }).runWithBuild()
  stub.restore()

  t.is(mockZipFunctions.callCount, runCount)

  const { args: call1Args } = mockZipFunctions.getCall(0)

  t.deepEqual(call1Args[2].configFileDirectories, [
    join(FIXTURES_DIR, 'functions_config_json/.netlify/functions-internal'),
  ])
})

test.serial('functions can have a config with different parameters passed to zip-it-and-ship-it', async (t) => {
  const zipItAndShipItSpy = sinon.spy(zipItAndShipIt, 'zipFunctions')
  const output = await new Fixture('./fixtures/functions_config_json')
    .withFlags({
      mode: 'buildbot',
    })
    .runWithBuild()

  zipItAndShipItSpy.restore()

  const { args: call1Args } = zipItAndShipItSpy.getCall(0)
  const { functions: functions } = await importJsonFile(call1Args[2].manifest)

  t.is(functions[0].displayName, 'Function One')
  t.is(functions[0].generator, '@netlify/mock-plugin@1.0.0')
  t.is(functions[1].displayName, undefined)

  t.snapshot(normalizeOutput(output))
})

test.serial('internalSrcFolder is passed to zip-it-and-ship-it and helps prefill the generator field', async (t) => {
  const zipItAndShipItSpy = sinon.spy(zipItAndShipIt, 'zipFunctions')

  await new Fixture('./fixtures/functions_internal_src_folder').withFlags({ mode: 'buildbot' }).runWithBuild()
  zipItAndShipItSpy.restore()
  const { args: call1Args } = zipItAndShipItSpy.getCall(0)

  const [paths, , options] = call1Args

  t.deepEqual(paths, {
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

  const { manifest } = options
  const { functions } = await importJsonFile(manifest)

  t.is(functions[0].generator, 'internalFunc')
  t.is(functions[1].generator, undefined)
})

test('Generates a `manifest.json` file when running outside of buildbot', async (t) => {
  await removeDir(`${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions`)
  await new Fixture('./fixtures/functions_internal_manifest').withFlags({ mode: 'cli' }).runWithBuild()
  const manifestPath = `${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions/manifest.json`

  t.true(await pathExists(manifestPath))

  const { functions, timestamp, version: manifestVersion } = await importJsonFile(manifestPath)

  t.is(functions.length, 3)
  t.is(typeof timestamp, 'number')
  t.is(manifestVersion, 1)
})

test('Generates a `manifest.json` file when the `buildbot_create_functions_manifest` feature flag is set', async (t) => {
  await removeDir(`${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions`)

  await new Fixture('./fixtures/functions_internal_manifest')
    .withFlags({ featureFlags: { buildbot_create_functions_manifest: true } })
    .runWithBuild()

  const manifestPath = `${FIXTURES_DIR}/functions_internal_manifest/.netlify/functions/manifest.json`

  t.true(await pathExists(manifestPath))

  const { functions, timestamp, version: manifestVersion } = await importJsonFile(manifestPath)

  t.is(functions.length, 3)
  t.is(typeof timestamp, 'number')
  t.is(manifestVersion, 1)
})
