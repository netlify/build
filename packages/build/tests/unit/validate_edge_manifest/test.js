import test from 'ava'

import { validateEdgeFunctionsManifest } from '../../../lib/plugins_core/edge_functions/validate_manifest/validate_edge_functions_manifest.js'

// eslint-disable-next-line ava/no-import-test-files
import { extraPropErrMsg, FIXTURES_DIR, invalidPatternMsg, missingPropErrMsg } from './util.js'

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

  t.is(error.message, invalidPatternMsg)
})

test('should detect missing property in manifest', async (t) => {
  const error = await t.throwsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'invalid_manifest_missing_property' },
    }),
  )

  t.is(error.message, missingPropErrMsg)
})

test('should detect extra property in manifest', async (t) => {
  const error = await t.throwsAsync(
    validateEdgeFunctionsManifest({
      buildDir: FIXTURES_DIR,
      constants: { EDGE_FUNCTIONS_DIST: 'invalid_manifest_extra_property' },
    }),
  )

  t.is(error.message, extraPropErrMsg)
})
