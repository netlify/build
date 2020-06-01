const { version } = require('process')

const test = require('ava')
const hasAnsi = require('has-ansi')

const { getJsonOpt } = require('../../../../config/tests/helpers/main')
const { runFixture } = require('../../helpers/main')

const env = { BUGSNAG_KEY: '00000000000000000000000000000000' }

test('Report build.command failure', async t => {
  await runFixture(t, 'command', { env })
})

test('Report configuration user error', async t => {
  await runFixture(t, 'config', { env })
})

test('Report plugin input error', async t => {
  await runFixture(t, 'plugin_input', { env })
})

test('Report plugin validation error', async t => {
  await runFixture(t, 'plugin_validation', { env })
})

test('Report plugin internal error', async t => {
  await runFixture(t, 'plugin_internal', { env })
})

test('Report utils.build.failBuild()', async t => {
  await runFixture(t, 'fail_build', { env })
})

test('Report utils.build.failPlugin()', async t => {
  await runFixture(t, 'fail_plugin', { env })
})

test('Report utils.build.cancelBuild()', async t => {
  await runFixture(t, 'cancel_build', { env })
})

test('Report IPC error', async t => {
  await runFixture(t, 'ipc', { env })
})

test('Report API error', async t => {
  await runFixture(t, 'cancel_build', { env: { ...env, DEPLOY_ID: 'test' }, flags: '--token=test' })
})

// Node v8 uses a different error message format
if (!version.startsWith('v8.')) {
  test('Report dependencies error', async t => {
    await runFixture(t, 'dependencies', { env })
  })
}

test('Report buildbot mode as releaseStage', async t => {
  await runFixture(t, 'command', { env, flags: '--mode=buildbot' })
})

test('Report CLI mode as releaseStage', async t => {
  await runFixture(t, 'command', { env, flags: '--mode=cli' })
})

test('Report programmatic mode as releaseStage', async t => {
  await runFixture(t, 'command', { env, flags: '--mode=require' })
})

test('Remove colors in error.message', async t => {
  const { stdout } = await runFixture(t, 'colors', { env, snapshot: false })
  const lines = stdout.split('\n').filter(line => line.includes('ColorTest'))
  t.true(lines.every(line => !hasAnsi(line)))
})

test('Report BUILD_ID', async t => {
  await runFixture(t, 'command', { env: { ...env, BUILD_ID: 'test' } })
})

test('Report plugin homepage', async t => {
  await runFixture(t, 'plugin_homepage', { env })
})

test('Report plugin origin', async t => {
  const defaultConfig = getJsonOpt({ plugins: [{ package: './plugin.js' }] })
  await runFixture(t, 'plugin_origin', { env, flags: `--defaultConfig=${defaultConfig}` })
})

test('Report build logs URLs', async t => {
  await runFixture(t, 'command', {
    env: { ...env, DEPLOY_ID: 'testDeployId', DEPLOY_URL: 'https://testDeployId--testSiteName.netlify.app' },
  })
})
