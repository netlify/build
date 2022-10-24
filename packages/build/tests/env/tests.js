import { platform } from 'process'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('Environment variables are set in plugins', async (t) => {
  const output = await new Fixture('./fixtures/plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

// Windows environment variables work differently
if (platform !== 'win32') {
  test('Environment variable in build.command', async (t) => {
    const output = await new Fixture('./fixtures/command').runWithBuild()
    t.snapshot(normalizeOutput(output))
  })
}

test('build.environment are set in plugins', async (t) => {
  const output = await new Fixture('./fixtures/build').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not pass BUGSNAG_KEY to build command and plugins', async (t) => {
  const output = await new Fixture('./fixtures/bugsnag_key')
    .withEnv({ BUGSNAG_KEY: '00000000000000000000000000000000' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('BRANCH environment variables is set with --branch', async (t) => {
  const output = await new Fixture('./fixtures/branch').withFlags({ branch: 'test' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('DEPLOY_ID environment variables is set with --deploy-id', async (t) => {
  const output = await new Fixture('./fixtures/deploy_id').withFlags({ deployId: 'test' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('BUILD_ID environment variables is set with --build-id', async (t) => {
  const output = await new Fixture('./fixtures/build_id').withFlags({ buildId: 'test-build' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('CONTEXT environment variables is set with --context', async (t) => {
  const output = await new Fixture('./fixtures/context').withFlags({ context: 'test' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})
