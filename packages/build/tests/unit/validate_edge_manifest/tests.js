import { fileURLToPath } from 'url'

import test from 'ava'

import { validateEdgeFunctionsManifest } from '../../../lib/plugins_core/edge_functions/validate_manifest/validate_edge_functions_manifest.js'

const FIXTURES_DIR = fileURLToPath(new URL('unit_fixtures', import.meta.url))

test('should validate valid manifest', async (t) => {
  await t.notThrowsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'valid_manifest' },
    }),
  )
})

test('should detect invalid route pattern in manifest', async (t) => {
  const error = await t.throwsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'invalid_manifest_wrong_route_pattern' },
    }),
  )

  t.snapshot(error.message)
})

test('should detect missing property in manifest', async (t) => {
  const error = await t.throwsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'invalid_manifest_missing_property' },
    }),
  )

  t.snapshot(error.message)
})

test('should detect extra property in manifest', async (t) => {
  const error = await t.throwsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'invalid_manifest_extra_property' },
    }),
  )

  t.snapshot(error.message)
})
