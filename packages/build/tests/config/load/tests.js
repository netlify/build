const { cwd } = require('process')
const { relative } = require('path')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Empty configuration', async t => {
  await runFixture(t, 'empty')
})

test('Can define options as environment variables', async t => {
  await runFixture(t, '', {
    config: false,
    env: {
      NETLIFY_BUILD_CONFIG: `${FIXTURES_DIR}/empty/netlify.yml`,
    },
  })
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
  await runFixture(t, '', { config: 'netlify-config-test', cwd: `${FIXTURES_DIR}/module` })
})

test('--config with an invalid Node module', async t => {
  await runFixture(t, '', { config: 'invalid', cwd: `${FIXTURES_DIR}/module` })
})

test('--config with a scoped Node module', async t => {
  await runFixture(t, '', { config: '@netlify/config-test', cwd: `${FIXTURES_DIR}/module` })
})

test('--config with an invalid scoped Node module', async t => {
  await runFixture(t, '', { config: '@netlify/invalid', cwd: `${FIXTURES_DIR}/module` })
})
