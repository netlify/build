const test = require('ava')
const execa = require('execa')

const { normalizeOutput } = require('./helpers/main.js')

const BINARY_PATH = `${__dirname}/../src/build/bin.js`
const FIXTURES_DIR = `${__dirname}/fixtures`

test('Smoke test', async t => {
  const { all } = await execa.command(BINARY_PATH, {
    cwd: `${FIXTURES_DIR}/smoke`
  })
  t.snapshot(normalizeOutput(all))
})

test.skip('Empty configuration', async t => {
  const { all } = await execa.command(BINARY_PATH, {
    cwd: `${FIXTURES_DIR}/empty`
  })
  t.snapshot(normalizeOutput(all))
})

test.skip('--config', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config ${FIXTURES_DIR}/empty/netlify.yml`)
  t.snapshot(normalizeOutput(all))
})

test.skip('--config with an invalid path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --config invalid`)
  t.snapshot(normalizeOutput(all))
})

test('{env:...}', async t => {
  const { all } = await execa.command(BINARY_PATH, {
    cwd: `${FIXTURES_DIR}/env`,
    env: { TEST: 'test' }
  })
  t.snapshot(normalizeOutput(all))
})

test('{secrets:...}', async t => {
  const { all } = await execa.command(BINARY_PATH, {
    cwd: `${FIXTURES_DIR}/secrets`
  })
  t.snapshot(normalizeOutput(all))
})

test('{context:...}', async t => {
  const { all } = await execa.command(BINARY_PATH, {
    cwd: `${FIXTURES_DIR}/context`
  })
  t.snapshot(normalizeOutput(all))
})

test.skip('{context:...} with --context', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --context development`, {
    cwd: `${FIXTURES_DIR}/context`
  })
  t.snapshot(normalizeOutput(all))
})

test.skip('{context:...} pointing to undefined path', async t => {
  const { all } = await execa.command(`${BINARY_PATH} --context invalid`, {
    cwd: `${FIXTURES_DIR}/context`
  })
  t.snapshot(normalizeOutput(all))
})
