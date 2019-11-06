const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('./helpers/main')

test('Empty configuration', async t => {
  await runFixture(t, 'empty')
})

test('No --config', async t => {
  await runFixture(t, '', { config: false, cwd: `${FIXTURES_DIR}/empty` })
})

test('No --config but none found', async t => {
  await runFixture(t, '', { config: false, cwd: '/' })
})

test('--config with an absolute path', async t => {
  await runFixture(t, 'empty')
})

test('--config with a relative path', async t => {
  await runFixture(t, '', { config: `${relative(cwd(), FIXTURES_DIR)}/empty/netlify.yml` })
})

test('--config with an invalid relative path', async t => {
  await runFixture(t, 'invalid')
})

test('--config with a Node module', async t => {
  await runFixture(t, '', { config: 'netlify-config-test', cwd: `${FIXTURES_DIR}/config_module` })
})

test('--config with an invalid Node module', async t => {
  await runFixture(t, '', { config: 'invalid', cwd: `${FIXTURES_DIR}/config_module` })
})

test('--config with a scoped Node module', async t => {
  await runFixture(t, '', { config: '@netlify/config-test', cwd: `${FIXTURES_DIR}/config_module` })
})

test('--config with an invalid scoped Node module', async t => {
  await runFixture(t, '', { config: '@netlify/invalid', cwd: `${FIXTURES_DIR}/config_module` })
})

test('--cwd with no config', async t => {
  await runFixture(t, '', { config: false, flags: `--cwd ${FIXTURES_DIR}/empty` })
})

test('--cwd with a relative path config', async t => {
  await runFixture(t, '', { config: 'empty/netlify.yml', flags: `--cwd ${relative(cwd(), FIXTURES_DIR)}` })
})

test('--cwd with a Node module config', async t => {
  await runFixture(t, '', { config: 'netlify-config-test', flags: `--cwd ${FIXTURES_DIR}/config_module` })
})

test('Can define options as environment variables', async t => {
  await runFixture(t, '', {
    config: false,
    env: {
      NETLIFY_BUILD_CONFIG: `${FIXTURES_DIR}/empty/netlify.yml`,
    },
  })
})
