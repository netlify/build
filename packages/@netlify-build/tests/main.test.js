const test = require('ava')
const execa = require('execa')

const { normalizeOutput } = require('./helpers/main.js')

const BINARY_PATH = `${__dirname}/../src/build/bin.js`
const FIXTURES_DIR = `${__dirname}/fixtures`

test('Smoke test', async t => {
  const { all } = await execa.command(`${BINARY_PATH}`, {
    cwd: `${FIXTURES_DIR}/smoke_test`
  })
  t.snapshot(normalizeOutput(all))
})
