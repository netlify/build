import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('Merges configuration after the `onPreBuild` and before the `onBuild` plugin events', async (t) => {
  const output = await new Fixture('./fixtures/deploy_config')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})
