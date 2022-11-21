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

test('should print error on invalid manifest', async (t) => {
  const error = await t.throwsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'invalid_manifest' },
    }),
  )

  t.snapshot(error.message)
})

test('should print error on empty manifest', async (t) => {
  const error = await t.throwsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'empty_manifest' },
    }),
  )

  t.snapshot(error.message)
})
