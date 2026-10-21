import { assert, expect, test } from 'vitest'

import { removeErrorColors } from '../../../lib/error/colors.js'
import { validateEdgeFunctionsManifest } from '../../../lib/plugins_core/edge_functions/validate_manifest/validate_edge_functions_manifest.js'

const getRejection = async (promise: Promise<unknown>): Promise<Error> => {
  try {
    await promise
  } catch (error) {
    assert.instanceOf(error, Error)
    return error
  }
  throw new Error('Expected the promise to reject')
}

test('should validate valid manifest', async () => {
  const manifest = {
    bundles: [
      {
        asset: 'f35baff44129a8f6be7db68590b2efd86ed4ba29000e2edbcaddc5d620d7d043.eszip',
        format: 'eszip2',
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

  await expect(validateEdgeFunctionsManifest(manifest)).resolves.toEqual({})
})

test('should print error on invalid manifest', async () => {
  const manifest = 'json'

  const error = await getRejection(validateEdgeFunctionsManifest(manifest))

  removeErrorColors(error)

  expect(error.message).toMatchSnapshot()
})

test('should print error on empty manifest', async () => {
  const error = await getRejection(validateEdgeFunctionsManifest({}))

  removeErrorColors(error)

  expect(error.message).toMatchSnapshot()
})
