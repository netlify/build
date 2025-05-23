import * as fs from 'fs/promises'
import { platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, removeDir, startServer } from '@netlify/testing'
import test from 'ava'
import getPort from 'get-port'
import tmp, { tmpName } from 'tmp-promise'

import { DEFAULT_FEATURE_FLAGS } from '../../lib/core/feature_flags.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Pass packageJson to plugins', async (t) => {
  const output = await new Fixture('./fixtures/package_json_valid').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Pass empty packageJson to plugins if no package.json', async (t) => {
  const output = await new Fixture('./fixtures/package_json_none')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('Pass empty packageJson to plugins if package.json invalid', async (t) => {
  const output = await new Fixture('./fixtures/package_json_invalid').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Can use pure ES modules with local plugins', async (t) => {
  const output = await new Fixture('./fixtures/es_modules_local').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Can use pure ES modules with module plugins', async (t) => {
  const output = await new Fixture('./fixtures/es_modules_module').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Can use CommonJS with local plugins', async (t) => {
  const output = await new Fixture('./fixtures/commonjs_local').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Local plugins', async (t) => {
  const output = await new Fixture('./fixtures/local').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Local plugins directory', async (t) => {
  const output = await new Fixture('./fixtures/local_dir').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Local plugins absolute path', async (t) => {
  const output = await new Fixture('./fixtures/local_absolute').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Local plugins invalid path', async (t) => {
  const output = await new Fixture('./fixtures/local_invalid').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Node module plugins', async (t) => {
  const output = await new Fixture('./fixtures/module').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('UI plugins', async (t) => {
  const output = await new Fixture('./fixtures/ui')
    .withFlags({
      defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Resolution is relative to the build directory', async (t) => {
  const output = await new Fixture('./fixtures/module_base')
    .withFlags({
      config: `${FIXTURES_DIR}/module_base/netlify.toml`,
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Resolution respects monorepo node module resolution rules', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo')
  const output = await fixture.withFlags({ packagePath: 'apps/unpinned' }).runWithBuild()
  // fixture has 2 versions of the same build plugin used by different workspaces
  // this ensures version used by apps/unpinned is used instead of version that
  // is hoisted in shared monorepo node_modules
  t.assert(output.indexOf('@8.5.3') > 0)
})

test('Non-existing plugins', async (t) => {
  const output = await new Fixture('./fixtures/non_existing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

const getNodePath = function (nodeVersion) {
  return `/home/user/.nvm/versions/node/v${nodeVersion}/bin/node`
}

test('Validate --node-path unsupported version does not fail when no plugins are used', async (t) => {
  const nodePath = getNodePath('8.2.0')
  const output = await new Fixture('./fixtures/empty').withFlags({ nodePath }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Validate --node-path version is supported by the plugin', async (t) => {
  const nodePath = getNodePath('16.14.0')
  const output = await new Fixture('./fixtures/engines')
    .withFlags({
      nodePath,
      debug: false,
    })
    .runWithBuild()
  t.true(normalizeOutput(output).includes('The Node.js version is 1.0.0 but the plugin "./plugin.js" requires >=1.0.0'))
})

test('Validate --node-path exists', async (t) => {
  const output = await new Fixture('./fixtures/node_version_simple')
    .withFlags({ nodePath: '/doesNotExist' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Provided --node-path version is unused in buildbot for local plugin executions if older than supported version', async (t) => {
  const nodePath = getNodePath('12.19.0')
  const output = await new Fixture('./fixtures/version_greater_than_minimum')
    .withFlags({ nodePath, mode: 'buildbot' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('UI plugins dont use provided --node-path', async (t) => {
  const nodePath = getNodePath('12.19.0')
  const output = await new Fixture('./fixtures/ui_auto_install')
    .withFlags({
      nodePath,
      mode: 'buildbot',
      defaultConfig: { plugins: [{ package: 'netlify-plugin-test' }] },
      testOpts: { skipPluginList: true },
    })
    .runWithBuild()
  const systemNodeVersion = process.version
  t.true(output.includes(`node.js version used to execute this plugin: ${systemNodeVersion}`))
})

test('Plugins can execute local binaries', async (t) => {
  const output = await new Fixture('./fixtures/local_bin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Plugin output can interleave stdout and stderr', async (t) => {
  const output = await new Fixture('./fixtures/interleave').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

// TODO: check output length once big outputs are actually fixed
test.serial('Big plugin output is not truncated', async (t) => {
  await new Fixture('./fixtures/big').runWithBuild()
  t.pass()
})

test('Plugins can have inputs', async (t) => {
  const output = await new Fixture('./fixtures/inputs').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Trusted plugins are passed featureflags and system log', async (t) => {
  const systemLogFile = await tmpName()
  const output = await new Fixture('./fixtures/feature_flags')
    .withFlags({
      featureFlags: { test_flag: true },
      debug: false,
      systemLogFile: await fs.open(systemLogFile, 'a'),
    })
    .runWithBuild()

  // windows doesn't support the `/dev/fd/` API we're relying on for system logging.
  if (platform !== 'win32') {
    const systemLog = (await fs.readFile(systemLogFile, { encoding: 'utf8' })).split('\n')

    const expectedSystemLogs = 'some system-facing logs'
    t.false(output.includes(expectedSystemLogs))
    t.true(systemLog.includes(expectedSystemLogs))
  }

  const expectedFlags = {
    ...DEFAULT_FEATURE_FLAGS,
    test_flag: true,
  }

  t.true(output.includes(JSON.stringify(expectedFlags)))

  const outputUntrusted = await new Fixture('./fixtures/feature_flags_untrusted')
    .withFlags({
      featureFlags: { test_flag: true },
      debug: false,
      systemLogFile: await fs.open(systemLogFile, 'a'),
    })
    .runWithBuild()

  t.true(outputUntrusted.includes('typeof featureflags: undefined'))
})

test('process.env changes are propagated to other plugins', async (t) => {
  const output = await new Fixture('./fixtures/env_changes_plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('process.env changes are propagated to onError and onEnd', async (t) => {
  const output = await new Fixture('./fixtures/env_changes_on_error').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('process.env changes are propagated to build.command', async (t) => {
  const output = await new Fixture('./fixtures/env_changes_command').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.environment changes are propagated to other plugins', async (t) => {
  const output = await new Fixture('./fixtures/env_changes_build_plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.environment changes are propagated to onError and onEnd', async (t) => {
  const output = await new Fixture('./fixtures/env_changes_build_on_error').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.environment changes are propagated to build.command', async (t) => {
  const output = await new Fixture('./fixtures/env_changes_build_command').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.environment and process.env changes can be mixed', async (t) => {
  const output = await new Fixture('./fixtures/env_changes_build_mix').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Expose some utils', async (t) => {
  const output = await new Fixture('./fixtures/keys').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Utils are defined', async (t) => {
  const output = await new Fixture('./fixtures/defined').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Can run utils', async (t) => {
  const functionsDir = `${FIXTURES_DIR}/functions_add/.netlify/functions-internal`
  await removeDir(functionsDir)
  try {
    const output = await new Fixture('./fixtures/functions_add').runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await removeDir(functionsDir)
  }
})

test('Cache utils are caching .dot directories as well', async (t) => {
  // cleanup cache first
  await removeDir([`${FIXTURES_DIR}/cache_utils/dist`, `${FIXTURES_DIR}/cache_utils/.netlify`])
  // generate cache
  await new Fixture('./fixtures/cache_utils').runWithBuild()
  // should have cached files in the output message
  const output = await new Fixture('./fixtures/cache_utils').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Can run list util', async (t) => {
  const output = await new Fixture('./fixtures/functions_list').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Git utils fails if no root', async (t) => {
  const output = await new Fixture('./fixtures/git_no_root')
    .withCopyRoot({ git: false })
    .then((fixtures) => fixtures.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('Git utils does not fail if no root and not used', async (t) => {
  const output = await new Fixture('./fixtures/keys')
    .withCopyRoot({ git: false })
    .then((fixtures) => fixtures.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('Validate plugin is an object', async (t) => {
  const output = await new Fixture('./fixtures/object').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Validate plugin event handler names', async (t) => {
  const output = await new Fixture('./fixtures/handler_name').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Validate plugin event handler function', async (t) => {
  const output = await new Fixture('./fixtures/handler_function').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Transpile TypeScript local plugins', async (t) => {
  const output = await new Fixture('./fixtures/ts_transpile').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Type-checks TypeScript local plugins', async (t) => {
  const output = await new Fixture('./fixtures/ts_type_check').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Type-checks TypeScript local plugins using tsconfig.json', async (t) => {
  const output = await new Fixture('./fixtures/ts_type_check_tsconfig').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not transpile already transpiled local plugins', async (t) => {
  const output = await new Fixture('./fixtures/ts_transpile_already').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Plugins which export a factory function receive the inputs and a metadata object', async (t) => {
  const output = await new Fixture('./fixtures/dynamic_plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Plugin events that do not emit to stderr/stdout are hidden from the logs', async (t) => {
  const output = await new Fixture('./fixtures/mixed_events').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Plugin errors that occur during the loading phase are piped to system logs', async (t) => {
  const systemLogFile = await tmp.file()
  const output = await new Fixture('./fixtures/syntax_error')
    .withFlags({
      debug: false,
      featureFlags: { netlify_build_plugin_system_log: true },
      systemLogFile: systemLogFile.fd,
    })
    .runWithBuild()

  if (platform !== 'win32') {
    const systemLog = await fs.readFile(systemLogFile.path, { encoding: 'utf8' })

    t.is(systemLog.trim(), `Plugin failed to initialize during the "load" phase: An error message thrown by Node.js`)
  }

  t.snapshot(normalizeOutput(output))
})

test.serial('Plugins have a pre-populated Blobs context', async (t) => {
  const serverPort = await getPort()
  const deployId = 'deploy123'
  const siteId = 'site321'
  const token = 'some-token'
  const { scheme, host, stopServer } = await startServer(
    [
      {
        response: { url: `http://localhost:${serverPort}/some-signed-url` },
        path: `/api/v1/blobs/${siteId}/deploy:${deployId}/my-key`,
      },
      {
        response: 'Hello there',
        path: `/some-signed-url`,
      },
    ],
    serverPort,
  )

  const { netlifyConfig } = await new Fixture('./fixtures/blobs_read')
    .withFlags({
      apiHost: host,
      deployId,
      testOpts: { scheme },
      siteId,
      token,
    })
    .runWithBuildAndIntrospect()

  await stopServer()

  t.is(netlifyConfig.build.command, `echo ""Hello there""`)
})

test('Plugins can respond anything to parent process', async (t) => {
  const build = await new Fixture('./fixtures/process_send_object').runBuildBinary()
  t.true(build.exitCode === 0)
})
