const test = require('ava')
const execa = require('execa')
const del = require('del')

const { version } = require('../package.json')

const { normalizeOutput } = require('./helpers/main.js')

const BINARY_PATH = `${__dirname}/../src/core/bin.js`
const FIXTURES_DIR = `${__dirname}/fixtures`

test('Smoke test', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/smoke/netlify.yml`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('Empty configuration', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('--config', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('--config with an invalid path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config invalid`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('{env:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/env/netlify.yml`, {
    env: { TEST: 'test' },
    all: true
  })
  t.snapshot(normalizeOutput(all))
})

test('{secrets:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/secrets/netlify.yml`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('{context:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('{context:...} with --context', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml --context development`,
    { all: true }
  )
  t.snapshot(normalizeOutput(all))
})

test('{context:...} pointing to undefined path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml --context invalid`, {
    all: true
  })
  t.snapshot(normalizeOutput(all))
})

test('Can override plugins', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/override/netlify.yml`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('--verbose', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --verbose --config invalid`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('Lifecycle commands can execute local binaries', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/local_bin/netlify.yml`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('Plugins can execute local binaries', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/local_bin_plugin/netlify.yml`, {
    all: true
  })
  t.snapshot(normalizeOutput(all))
})

test('--help', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --help`, { all: true })
  t.snapshot(normalizeOutput(all))
})

test('--version', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --version`, { all: true })
  t.is(all, version)
})

test('Can define options as environment variables', async t => {
  const { all } = await execa.command(BINARY_PATH, {
    env: {
      NETLIFY_BUILD_CONFIG: `${FIXTURES_DIR}/empty/netlify.yml`
    },
    all: true
  })
  t.snapshot(normalizeOutput(all))
})

test('Install local plugin dependencies', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/plugin_deps/netlify.yml`, { all: true })
  await del(`${FIXTURES_DIR}/plugin_deps/plugin/node_modules`)
  t.snapshot(normalizeOutput(all))
})
