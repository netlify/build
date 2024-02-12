import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('Does not mutate read-only properties', async (t) => {
  const output = await new Fixture('./fixtures/readonly_properties')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Merges configuration after the `onPreBuild` and before the `onBuild` plugin events', async (t) => {
  const output = await new Fixture('./fixtures/deploy_config')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Throws an error if the deploy configuration file is malformed', async (t) => {
  const output = await new Fixture('./fixtures/malformed_config')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not throw an error if the deploy configuration file is missing', async (t) => {
  const output = await new Fixture('./fixtures/missing_config')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})
