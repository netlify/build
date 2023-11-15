import * as fs from 'fs/promises'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, removeDir } from '@netlify/testing'
import test from 'ava'
import { tmpName } from 'tmp-promise'

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

test('Non-existing plugins', async (t) => {
  const output = await new Fixture('./fixtures/non_existing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test.skip('Do not allow overriding core plugins', async (t) => {
  const output = await new Fixture('./fixtures/core_override').runWithBuild()
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
  const output = await new Fixture('./fixtures/engines').withFlags({ nodePath }).runWithBuild()
  t.snapshot(normalizeOutput(output))
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

test('Plugins are passed featureflags', async (t) => {
  const systemLogFile = await tmpName()
  const output = await new Fixture('./fixtures/feature_flags')
    .withFlags({
      featureFlags: { test_flag: true },
      debug: false,
      systemLogFile: await fs.open(systemLogFile, 'a'),
    })
    .runWithBuild()

  const systemLog = await fs.readFile(systemLogFile, { encoding: 'utf8' })

  const expectedSystemLogs = 'some system-facing logs'
  t.false(output.includes(expectedSystemLogs))
  t.is(systemLog, expectedSystemLogs)

  t.true(
    output.includes(
      JSON.stringify({
        buildbot_zisi_trace_nft: false,
        buildbot_zisi_esbuild_parser: false,
        buildbot_zisi_system_log: false,
        edge_functions_cache_cli: false,
        edge_functions_system_logger: false,
        test_flag: true,
      }),
    ),
  )

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
