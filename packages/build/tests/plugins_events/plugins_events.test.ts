import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test, vi } from 'vitest'

interface DevCommandOptions {
  netlifyConfig: unknown
  childEnv: Record<string, string | undefined>
}

test('plugin.onSuccess is triggered on success', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/success_ok').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onSuccess is not triggered on failure', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/success_not_ok').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onSuccess is not triggered on failPlugin()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/success_fail_plugin').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onSuccess is not triggered on cancelBuild()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/success_cancel_build').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onSuccess can fail but does not stop builds', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/success_fail').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onError is not triggered on success', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/error_ok').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onError is triggered on failure', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/error_not_ok').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onError is not triggered on failPlugin()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/error_fail_plugin').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onError is triggered on cancelBuild()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/error_cancel_build').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onError can fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/error_fail').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onError gets an error argument', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/error_argument').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onError can be used in several plugins', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/error_several').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onEnd is triggered on success', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/end_ok').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onEnd is triggered on failure', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/end_not_ok').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onEnd is not triggered on failPlugin()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/end_fail_plugin').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onEnd is triggered on cancelBuild()', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/end_cancel_build').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onEnd can fail but it does not stop builds', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/end_fail').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onEnd and plugin.onError can be used together', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/end_error').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('plugin.onEnd can be used in several plugins', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/end_several').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not run `*Dev` events on the build timeline', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/dev_and_build')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Runs the `*Dev` events and not the `*Build` events on the dev timeline', async () => {
  const devCommand = vi.fn(() => Promise.resolve())

  const output = await new Fixture(import.meta.url, './fixtures/dev_and_build')
    .withFlags({ debug: false, timeline: 'dev' })
    .runDev(devCommand)
  expect(normalizeOutput(output)).toMatchSnapshot()

  expect(devCommand).toHaveBeenCalledTimes(1)
})

test('Keeps output to a minimum in the `startDev` entrypoint when `quiet: true`', async () => {
  const devCommand = vi.fn(() => Promise.resolve())

  const output = await new Fixture(import.meta.url, './fixtures/dev_and_build')
    .withFlags({ debug: false, quiet: true, timeline: 'dev' })
    .runDev(devCommand)
  expect(normalizeOutput(output)).toMatchSnapshot()

  expect(devCommand).toHaveBeenCalledTimes(1)
})

test('Shows error information in the `startDev` entrypoint even when `quiet: true`', async () => {
  const devCommand = vi.fn(() => Promise.resolve())

  const output = await new Fixture(import.meta.url, './fixtures/dev_with_error')
    .withFlags({ debug: false, quiet: true, timeline: 'dev' })
    .runDev(devCommand)
  expect(normalizeOutput(output)).toMatchSnapshot()

  expect(devCommand).toHaveBeenCalledTimes(0)
})

test('Passes plugin options into dev command', async () => {
  const devCommand = vi.fn<(options: DevCommandOptions) => Promise<void>>(() => Promise.resolve())

  await new Fixture(import.meta.url, './fixtures/dev_and_build')
    .withFlags({ debug: false, quiet: true, timeline: 'dev' })
    .runDev(devCommand)

  expect(devCommand).toHaveBeenCalledTimes(1)
  const [options] = devCommand.mock.lastCall ?? []
  expect(options).toBeTruthy()
  expect(options?.netlifyConfig).toBeTruthy()
  expect(options?.childEnv.TEST_ASSIGN).toBeTruthy()
})
