'use strict'

const test = require('ava')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('Pass packageJson to plugins', async (t) => {
  await runFixture(t, 'package_json_valid')
})

test('Pass empty packageJson to plugins if no package.json', async (t) => {
  await runFixture(t, 'package_json_none', { copyRoot: { git: false } })
})

test('Pass empty packageJson to plugins if package.json invalid', async (t) => {
  await runFixture(t, 'package_json_invalid')
})

test('Can use pure ES modules with local plugins', async (t) => {
  await runFixture(t, 'es_modules_local')
})

test('Local plugins', async (t) => {
  await runFixture(t, 'local')
})

test('Local plugins directory', async (t) => {
  await runFixture(t, 'local_dir')
})

test('Local plugins absolute path', async (t) => {
  await runFixture(t, 'local_absolute')
})

test('Local plugins invalid path', async (t) => {
  await runFixture(t, 'local_invalid')
})

test('Node module plugins', async (t) => {
  await runFixture(t, 'module')
})

test('UI plugins', async (t) => {
  const defaultConfig = { plugins: [{ package: 'netlify-plugin-test' }] }
  await runFixture(t, 'ui', { flags: { defaultConfig } })
})

test('Resolution is relative to the build directory', async (t) => {
  await runFixture(t, 'module_base', { flags: { config: `${FIXTURES_DIR}/module_base/netlify.toml` } })
})

test('Non-existing plugins', async (t) => {
  await runFixture(t, 'non_existing')
})

test('Do not allow overriding core plugins', async (t) => {
  await runFixture(t, 'core_override')
})

const getNodePath = function (nodeVersion) {
  return `/home/user/.nvm/versions/node/v${nodeVersion}/bin/node`
}

test('Validate --node-path unsupported version does not fail when no plugins are used', async (t) => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'empty', {
    flags: { nodePath },
  })
})

test('Validate --node-path version is supported by the plugin', async (t) => {
  const nodePath = getNodePath('14.14.0')
  await runFixture(t, 'engines', {
    flags: { nodePath },
  })
})

test('Validate --node-path exists', async (t) => {
  await runFixture(t, 'node_version_simple', {
    flags: { nodePath: '/doesNotExist' },
  })
})

test('Provided --node-path version is unused in buildbot for local plugin executions if older than supported version', async (t) => {
  const nodePath = getNodePath('12.19.0')
  await runFixture(t, 'version_greater_than_minimum', {
    flags: { nodePath, mode: 'buildbot' },
  })
})

test('Plugins can execute local binaries', async (t) => {
  await runFixture(t, 'local_bin')
})

test('Plugin output can interleave stdout and stderr', async (t) => {
  await runFixture(t, 'interleave')
})

// TODO: check output length once big outputs are actually fixed
test.serial('Big plugin output is not truncated', async (t) => {
  await runFixture(t, 'big', { snapshot: false })
  t.pass()
})

test('Plugins can have inputs', async (t) => {
  await runFixture(t, 'inputs')
})

test('process.env changes are propagated to other plugins', async (t) => {
  await runFixture(t, 'env_changes_plugin')
})

test('process.env changes are propagated to onError and onEnd', async (t) => {
  await runFixture(t, 'env_changes_on_error')
})

test('process.env changes are propagated to build.command', async (t) => {
  await runFixture(t, 'env_changes_command')
})

test('build.environment changes are propagated to other plugins', async (t) => {
  await runFixture(t, 'env_changes_build_plugin')
})

test('build.environment changes are propagated to onError and onEnd', async (t) => {
  await runFixture(t, 'env_changes_build_on_error')
})

test('build.environment changes are propagated to build.command', async (t) => {
  await runFixture(t, 'env_changes_build_command')
})

test('build.environment and process.env changes can be mixed', async (t) => {
  await runFixture(t, 'env_changes_build_mix')
})

test('Expose some utils', async (t) => {
  await runFixture(t, 'keys')
})

test('Utils are defined', async (t) => {
  await runFixture(t, 'defined')
})

test('Can run utils', async (t) => {
  const functionsDir = `${FIXTURES_DIR}/functions_add/.netlify/functions-internal`
  await removeDir(functionsDir)
  try {
    await runFixture(t, 'functions_add')
  } finally {
    await removeDir(functionsDir)
  }
})

test('Can run list util', async (t) => {
  await runFixture(t, 'functions_list')
})

test('Git utils fails if no root', async (t) => {
  await runFixture(t, 'git_no_root', { copyRoot: { git: false } })
})

test('Git utils does not fail if no root and not used', async (t) => {
  await runFixture(t, 'keys', { copyRoot: { git: false } })
})

test('Validate plugin is an object', async (t) => {
  await runFixture(t, 'object')
})

test('Validate plugin event handler names', async (t) => {
  await runFixture(t, 'handler_name')
})

test('Validate plugin event handler function', async (t) => {
  await runFixture(t, 'handler_function')
})

test('Transpile TypeScript local plugins', async (t) => {
  await runFixture(t, 'ts_transpile', { copyRoot: { git: false } })
})

test('Type-checks TypeScript local plugins', async (t) => {
  await runFixture(t, 'ts_type_check')
})

test('Type-checks TypeScript local plugins using tsconfig.json', async (t) => {
  await runFixture(t, 'ts_type_check_tsconfig')
})

test('Does not transpile already transpiled local plugins', async (t) => {
  await runFixture(t, 'ts_transpile_already')
})
