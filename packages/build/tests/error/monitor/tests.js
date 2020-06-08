const { version } = require('process')

const test = require('ava')
const hasAnsi = require('has-ansi')

const { escapeExecaOpt } = require('../../../../config/tests/helpers/main')
const { runFixture } = require('../../helpers/main')

const flags = '--test-opts.error-monitor --bugsnag-key=00000000000000000000000000000000'

test('Report build.command failure', async t => {
  await runFixture(t, 'command', { flags })
})

test('Report configuration user error', async t => {
  await runFixture(t, 'config', { flags })
})

test('Report plugin input error', async t => {
  await runFixture(t, 'plugin_input', { flags })
})

test('Report plugin validation error', async t => {
  await runFixture(t, 'plugin_validation', { flags })
})

test('Report plugin internal error', async t => {
  await runFixture(t, 'plugin_internal', { flags })
})

test('Report utils.build.failBuild()', async t => {
  await runFixture(t, 'fail_build', { flags })
})

test('Report utils.build.failPlugin()', async t => {
  await runFixture(t, 'fail_plugin', { flags })
})

test('Report utils.build.cancelBuild()', async t => {
  await runFixture(t, 'cancel_build', { flags })
})

test('Report IPC error', async t => {
  await runFixture(t, 'ipc', { flags })
})

test('Report API error', async t => {
  await runFixture(t, 'cancel_build', { flags: `${flags} --token=test --deploy-id=test` })
})

// Node v8 uses a different error message format
if (!version.startsWith('v8.')) {
  test('Report dependencies error', async t => {
    await runFixture(t, 'dependencies', { flags })
  })
}

test('Report buildbot mode as releaseStage', async t => {
  await runFixture(t, 'command', { flags: `${flags} --mode=buildbot` })
})

test('Report CLI mode as releaseStage', async t => {
  await runFixture(t, 'command', { flags: `${flags} --mode=cli` })
})

test('Report programmatic mode as releaseStage', async t => {
  await runFixture(t, 'command', { flags: `${flags} --mode=require` })
})

test('Remove colors in error.message', async t => {
  const { returnValue } = await runFixture(t, 'colors', { flags, snapshot: false })
  const lines = returnValue.split('\n').filter(line => line.includes('ColorTest'))
  t.true(lines.every(line => !hasAnsi(line)))
})

test('Report BUILD_ID', async t => {
  await runFixture(t, 'command', { flags, env: { BUILD_ID: 'test' } })
})

test('Report plugin homepage', async t => {
  await runFixture(t, 'plugin_homepage', { flags })
})

test('Report plugin origin', async t => {
  const defaultConfig = escapeExecaOpt(JSON.stringify({ plugins: [{ package: './plugin.js' }] }))
  await runFixture(t, 'plugin_origin', { flags: `${flags} --defaultConfig=${defaultConfig}` })
})

test('Report build logs URLs', async t => {
  await runFixture(t, 'command', {
    flags,
    env: { DEPLOY_ID: 'testDeployId', DEPLOY_URL: 'https://testDeployId--testSiteName.netlify.app' },
  })
})
