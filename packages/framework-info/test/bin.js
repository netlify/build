const test = require('ava')
const execa = require('execa')
const { getBinPath } = require('get-bin-path')

const { FIXTURES_DIR } = require('./helpers/main.js')

const BINARY_PATH = getBinPath()

test('CLI --help flag', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, ['--help'])
  t.snapshot(stdout)
})

test('CLI print framework names', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, [`${FIXTURES_DIR}/multiple`])
  t.snapshot(stdout)
})

test('CLI print "unknown" when none found', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, [`${FIXTURES_DIR}/empty`])
  t.is(stdout, 'unknown')
})

test('CLI --long flag', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, ['--long', `${FIXTURES_DIR}/multiple`])
  t.snapshot(stdout)
})

test('CLI should not recommend Next.js plugin when --node-version flag is less than v10.13.0', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, ['--long', '--node-version', 'v8.0.0', `${FIXTURES_DIR}/next-plugin`])
  t.snapshot(stdout)
})

test('CLI should recommend Next.js plugin when --node-version flag is v10.13.0', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, ['--long', '--node-version', 'v10.13.0', `${FIXTURES_DIR}/next-plugin`])
  t.snapshot(stdout)
})
