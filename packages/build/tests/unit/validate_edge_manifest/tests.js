import test from 'ava'

import { validateEdgeFunctionsManifest } from '../../../lib/plugins_core/edge_functions/validate_manifest/validate_edge_functions_manifest.js'

test('should validate valid manifest', async (t) => {
  const manifest = {
    bundles: [
      {
        asset: 'f35baff44129a8f6be7db68590b2efd86ed4ba29000e2edbcaddc5d620d7d043.js',
        format: 'js',
      },
    ],
    routes: [
      {
        function: 'hello',
        pattern: '^/hello/?$',
      },
      {
        function: 'geolocation',
        pattern: '^/geolocation/?$',
      },
      {
        function: 'json',
        pattern: '^/json/?$',
      },
    ],
    bundler_version: '1.6.0',
  }

  await t.notThrowsAsync(validateEdgeFunctionsManifest(manifest))
})

test('should print error on invalid manifest', async (t) => {
  const manifest = 'json'

  const error = await t.throwsAsync(validateEdgeFunctionsManifest(manifest))

  t.snapshot(error.message)
})

test('should print error on empty manifest', async (t) => {
  const error = await t.throwsAsync(validateEdgeFunctionsManifest({}))

  t.snapshot(error.message)
})
