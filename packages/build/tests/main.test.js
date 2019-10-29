require('log-process-errors/build/register/ava')

const { platform, cwd } = require('process')
const { relative } = require('path')

const test = require('ava')
const execa = require('execa')
const del = require('del')
const { getBinPathSync } = require('get-bin-path')

const { version } = require('../package.json')

const { normalizeOutput } = require('./helpers/main.js')

const BINARY_PATH = getBinPathSync({ cwd: __dirname })
const FIXTURES_DIR = `${__dirname}/fixtures`

test('Empty configuration', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('No --config', async t => {
  const { all } = await execa.command(`${BINARY_PATH}`, {
    all: true,
    reject: false,
    cwd: `${FIXTURES_DIR}/empty`,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config with an absolute path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config with a relative path', async t => {
  const fixtureDir = relative(cwd(), FIXTURES_DIR)
  const { all } = await execa.command(`${BINARY_PATH} --config ${fixtureDir}/empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config with an invalid relative path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config invalid`, { all: true, reject: false })
  t.snapshot(normalizeOutput(all))
})

test('--config with a Node module', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config netlify-config-test`, {
    all: true,
    reject: false,
    cwd: `${FIXTURES_DIR}/config_module`,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config with an invalid Node module', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config invalid`, {
    all: true,
    reject: false,
    cwd: `${FIXTURES_DIR}/config_module`,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config with a scoped Node module', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config @netlify/config-test`, {
    all: true,
    reject: false,
    cwd: `${FIXTURES_DIR}/config_module`,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config with an invalid scoped Node module', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config @netlify/invalid`, {
    all: true,
    reject: false,
    cwd: `${FIXTURES_DIR}/config_module`,
  })
  t.snapshot(normalizeOutput(all))
})

test('--cwd with no config', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --cwd ${FIXTURES_DIR}/empty`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--cwd with a relative path config', async t => {
  const fixtureDir = relative(cwd(), FIXTURES_DIR)
  const { all } = await execa.command(`${BINARY_PATH} --cwd ${fixtureDir} --config empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--cwd with a Node module config', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config netlify-config-test --cwd ${FIXTURES_DIR}/config_module`,
    { all: true, reject: false },
  )
  t.snapshot(normalizeOutput(all))
})

test('{env:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/env/netlify.yml`, {
    env: { TEST: 'test' },
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('{secrets:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/secrets_conf/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('{context:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('{context:...} with --context', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml --context development`,
    { all: true, reject: false },
  )
  t.snapshot(normalizeOutput(all))
})

test('{context:...} pointing to undefined path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml --context invalid`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Can override plugins', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/override/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Lifecycle commands can execute local binaries', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/local_bin/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Plugins can execute local binaries', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/local_bin_plugin/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--help', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --help`, { all: true, reject: false })
  t.snapshot(normalizeOutput(all))
})

test('--version', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --version`, { all: true, reject: false })
  t.is(all, version)
})

test('Can define options as environment variables', async t => {
  const { all } = await execa.command(BINARY_PATH, {
    env: {
      NETLIFY_BUILD_CONFIG: `${FIXTURES_DIR}/empty/netlify.yml`,
    },
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Can install plugins as Node modules', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/module_plugin/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Reports missing plugins', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/missing_plugin/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Plugin.id is optional', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/optional_plugin_id/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Can install local plugins', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/local_plugin/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Install local plugin dependencies: with npm', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_deps/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))

  await del(`${FIXTURES_DIR}/plugin_deps/plugin/node_modules`)
})

// This test does not work on Windows when run inside Ava
if (platform !== 'win32') {
  test('Install local plugin dependencies: with yarn', async t => {
    const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_deps_yarn/netlify.yml`, {
      all: true,
      reject: false,
    })
    t.snapshot(normalizeOutput(all))

    await del(`${FIXTURES_DIR}/plugin_deps_yarn/plugin/node_modules`)
  })
}

test('Install local plugin dependencies: propagate errors', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_deps_error/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Install local plugin dependencies: already installed', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_deps_already/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Install local plugin dependencies: no package.json', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_deps_no_package/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Functions: simple setup', async t => {
  await del(`${FIXTURES_DIR}/functions/.netlify/functions/`)

  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/functions/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Functions: invalid source directory', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/functions_invalid/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Functions: install dependencies top-level', async t => {
  await del([
    `${FIXTURES_DIR}/functions_deps/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_deps/functions/node_modules/`,
  ])

  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/functions_deps/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))

  await del(`${FIXTURES_DIR}/functions_deps/functions/node_modules/`)
})

test('Functions: install dependencies nested', async t => {
  await del([
    `${FIXTURES_DIR}/functions_deps_dir/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_deps_dir/functions/function/node_modules/`,
  ])

  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/functions_deps_dir/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))

  await del(`${FIXTURES_DIR}/functions_deps_dir/functions/function/node_modules/`)
})

test('Functions: ignore package.json inside node_modules', async t => {
  await del(`${FIXTURES_DIR}/functions_deps_node_modules/.netlify/functions/`)

  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/functions_deps_node_modules/netlify.yml`,
    { all: true, reject: false },
  )
  t.snapshot(normalizeOutput(all))
})

test('Exit code is 0 on success', async t => {
  const { exitCode } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.is(exitCode, 0)
})

test('Exit code is 1 on error', async t => {
  const { exitCode } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/does_not_exist`, {
    all: true,
    reject: false,
  })
  t.is(exitCode, 1)
})

test('Redact secrets in build.lifecycle', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/secrets_lifecycle/netlify.yml`, {
    all: true,
    reject: false,
    env: { SECRET_ENV_VAR: 'apiKey' },
  })
  t.snapshot(normalizeOutput(all))
})

test('Redact secrets in plugins', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/secrets_plugin/netlify.yml`, {
    all: true,
    reject: false,
    env: { SECRET_ENV_VAR: 'apiKey' },
  })
  t.snapshot(normalizeOutput(all))
})

test('Validate plugin.name is required', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_validate_name_required/netlify.yml`,
    { all: true, reject: false },
  )
  t.snapshot(normalizeOutput(all))
})

test('Validate plugin.name is a string', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_validate_name_string/netlify.yml`,
    { all: true, reject: false },
  )
  t.snapshot(normalizeOutput(all))
})

test('Remove duplicate plugin options', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/duplicate_plugin/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Does not remove duplicate plugin options with different ids', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/duplicate_plugin_different_id/netlify.yml`,
    { all: true, reject: false },
  )
  t.snapshot(normalizeOutput(all))
})

test('Remove duplicate plugin options with different configs but same id', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/duplicate_plugin_different_config/netlify.yml`,
    { all: true, reject: false },
  )
  t.snapshot(normalizeOutput(all))
})

test('Print stack trace of plugin errors', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/error_plugin/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Print stack trace of lifecycle command errors', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/error_lifecycle/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Print stack trace of lifecycle command errors with stack traces', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/error_lifecycle_stack/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Print stack trace of validation errors', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/invalid`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--dry with 0 hooks', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --dry --config ${FIXTURES_DIR}/dry_empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--dry with 1 hook', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --dry --config ${FIXTURES_DIR}/dry_single/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--dry with several hooks', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --dry --config ${FIXTURES_DIR}/dry/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})
