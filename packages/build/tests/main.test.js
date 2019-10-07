const test = require('ava')
const execa = require('execa')

const { normalizeOutput } = require('./helpers/main.js')

const BINARY_PATH = `${__dirname}/../src/core/bin.js`
const FIXTURES_DIR = `${__dirname}/fixtures`

test('Smoke test', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/smoke/netlify.yml`)
  t.snapshot(normalizeOutput(all))
})

test('Empty configuration', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`)
  t.snapshot(normalizeOutput(all))
})

test('--config', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`)
  t.snapshot(normalizeOutput(all))
})

test('--config with an invalid path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config invalid`)
  t.snapshot(normalizeOutput(all))
})

test('{env:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/env/netlify.yml`, {
    env: { TEST: 'test' }
  })
  t.snapshot(normalizeOutput(all))
})

test('{secrets:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/secrets/netlify.yml`)
  t.snapshot(normalizeOutput(all))
})

test('{context:...}', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml`)
  t.snapshot(normalizeOutput(all))
})

test('{context:...} with --context', async t => {
  const { all } = await execa.command(
    `${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml --context development`
  )
  t.snapshot(normalizeOutput(all))
})

test('{context:...} pointing to undefined path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/context/netlify.yml --context invalid`)
  t.snapshot(normalizeOutput(all))
})

test('Can override plugins', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/override/netlify.yml`)
  t.snapshot(normalizeOutput(all))
})
