const test = require('ava')
const execa = require('execa')
const del = require('del')

const { version } = require('../package.json')

const { normalizeOutput } = require('./helpers/main.js')

const BINARY_PATH = `${__dirname}/../src/core/bin.js`
const FIXTURES_DIR = `${__dirname}/fixtures`

test('Smoke test', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/smoke/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('Empty configuration', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))
})

test('--config with an invalid path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config invalid`, { all: true, reject: false })
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
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/secrets/netlify.yml`, {
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

test('--verbose', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --verbose --config invalid`, { all: true, reject: false })
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

test('Install local plugin dependencies: with yarn', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_deps_yarn/netlify.yml`, {
    all: true,
    reject: false,
  })
  t.snapshot(normalizeOutput(all))

  await del(`${FIXTURES_DIR}/plugin_deps_yarn/plugin/node_modules`)
})

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
