import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('exception', async (t) => {
  const output = await new Fixture('./fixtures/exception').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception with static properties', async (t) => {
  const output = await new Fixture('./fixtures/exception_props').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception with circular references', async (t) => {
  const output = await new Fixture('./fixtures/exception_circular').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception that are strings', async (t) => {
  const output = await new Fixture('./fixtures/exception_string').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception that are arrays', async (t) => {
  const output = await new Fixture('./fixtures/exception_array').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Do not log secret values on build errors', async (t) => {
  const output = await new Fixture('./fixtures/log_secret').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('TOML parsing errors', async (t) => {
  const output = await new Fixture('./fixtures/toml_parsing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Invalid error instances', async (t) => {
  const output = await new Fixture('./fixtures/invalid_instance').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Top-level errors', async (t) => {
  const output = await new Fixture('./fixtures/top').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Top function errors local', async (t) => {
  const output = await new Fixture('./fixtures/function').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Node module all fields', async (t) => {
  const output = await new Fixture('./fixtures/full').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Node module partial fields', async (t) => {
  const output = await new Fixture('./fixtures/partial').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('No repository root', async (t) => {
  const output = await new Fixture('./fixtures/no_root')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('Process warnings', async (t) => {
  const output = await new Fixture('./fixtures/warning').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Uncaught exception', async (t) => {
  const output = await new Fixture('./fixtures/uncaught').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Unhandled promises', async (t) => {
  const output = await new Fixture('./fixtures/unhandled_promise').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Exits in plugins', async (t) => {
  const output = await new Fixture('./fixtures/plugin_exit').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Plugin errors can have a toJSON() method', async (t) => {
  const output = await new Fixture('./fixtures/plugin_error_to_json').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

// Process exit is different on Windows
// @todo: re-enable. This test is currently randomly failing.
// @todo: uncomment after upgrading to Ava v4.
// See https://github.com/netlify/build/issues/3615
// if (platform !== 'win32') {
//   test.skip('Early exit', async (t) => {
//     await runFixture(t, 'early_exit')
//   })
// }

test('Redact API token on errors', async (t) => {
  const output = await new Fixture('./fixtures/api_token_redact')
    .withFlags({ token: '0123456789abcdef', deployId: 'test', mode: 'buildbot', testOpts: { host: '...' } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})
