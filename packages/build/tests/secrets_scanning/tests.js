import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test("secrets scanning, don't run when secrets are provided/default", async (t) => {
  const output = await new Fixture('./fixtures/src_default').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test("secrets scanning, don't run when there are no secrets and enhanced scan not enabled", async (t) => {
  const { requests } = await new Fixture('./fixtures/src_default')
    .withFlags({ debug: false, explicitSecretKeys: '', deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test("secrets scanning, don't run when no explicit secrets, enhanced scan enabled but no likely secrets", async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_no_likely_enhanced_scan_secrets')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, run and report result to API when there are no secrets and enhanced scan is enabled with likely secrets', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.method, 'PATCH')
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.truthy(request.body.secrets_scan.secretsScanMatches)
  t.truthy(request.body.secrets_scan.enhancedSecretsScanMatches)
})

test('secrets scanning, should skip with secrets but SECRETS_SCAN_ENABLED=false', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_disabled')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip with enhanced scan but SECRETS_SCAN_ENABLED=false', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets_disabled')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, should skip when secrets passed but no env vars set', async (t) => {
  const output = await new Fixture('./fixtures/src_default')
    .withFlags({ debug: false, explicitSecretKeys: 'abc,DEF' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when enhanced scan enabled but no env vars set', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_default')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, should skip when secrets passed but no non-empty/trivial env vars set', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_env_vars_set_empty')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_,2ENV_VAR_3,ENV_VAR_4,ENV_VAR_5' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when enhanced scan enabled but no non-empty/trivial env vars set', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_KEYS omits all of them', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_all_keys')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when enhanced scan and likely secrets passed but SECRETS_SCAN_OMIT_KEYS omits all of them', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_omit_all_keys')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_PATHS omits all files', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_all_paths')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('secrets scanning, should skip when enhanced scan and likely secrets passed but SECRETS_SCAN_OMIT_PATHS omits all files', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_omit_all_paths')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_PATHS omits globbed files', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_glob_path')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()

  t.false(normalizeOutput(output).includes('found value at line 1 in dist/safefile.js'))
  t.false(normalizeOutput(output).includes('found value at line 1 in src/static-files/safefile.js'))

  // Ensure SECRETS_SCAN_OMIT_PATHS doesn't exclude more than the defined glob
  t.assert(normalizeOutput(output).includes('found value at line 1 in src/static-files/notsafefile.js'))
})

test('secrets scanning, should fail build and report to API when it finds secrets in the src and build output', async (t) => {
  const { output, requests } = await new Fixture('./fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })
  t.snapshot(normalizeOutput(output))

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.method, 'PATCH')
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.is(request.body.secrets_scan.secretsScanMatches.length, 32)
  t.is(request.body.secrets_scan.enhancedSecretsScanMatches.length, 0)
})

test('secrets scanning, should fail build and report to API when enhanced scan finds likely secret in the src and build output', async (t) => {
  const { output, requests } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({ debug: false, explicitSecretKeys: '', enhancedSecretScan: true, deployId: 'test', token: 'test' })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.assert(normalizeOutput(output).includes(`Env var "ENV_VAR_1"'s value detected as a likely secret value`))
  t.assert(
    normalizeOutput(output).includes(
      `the build will fail until these secret values are not found in build output or repo files`,
    ),
  )
  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.method, 'PATCH')
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.is(request.body.secrets_scan.secretsScanMatches.length, 0)
  t.is(request.body.secrets_scan.enhancedSecretsScanMatches.length, 1)
})

test('secrets scanning should report success to API when no secrets are found', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_env_vars_no_matches')
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2',
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.method, 'PATCH')
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.truthy(request.body.secrets_scan.secretsScanMatches)
  t.truthy(request.body.secrets_scan.enhancedSecretsScanMatches)
})

test('secrets scanning, should report success to API when enhanced scans finds no likely secrets', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_env_vars_no_matches')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.method, 'PATCH')
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.truthy(request.body.secrets_scan.secretsScanMatches)
  t.truthy(request.body.secrets_scan.enhancedSecretsScanMatches)
})

test('secrets scanning failure should produce an user error', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
    })
    .runBuildProgrammatic()
  // Severity code of 2 is user error
  t.is(severityCode, 2)
})

test('secrets scanning, enhanced scanning failure should produce a user error', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
    })
    .runBuildProgrammatic()
  // Severity code of 2 is user error
  t.is(severityCode, 2)
})

test('secrets scan does not send report to API for local builds', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
      deployId: '0',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/0/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, should not fail if the secrets values are not detected in the build output', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_env_vars_no_matches')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.true(output.includes(`No secrets detected in build output or repo code!`))
})

test('secrets scanning should not scan .cache/ directory', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_cache_path')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.true(output.includes(`No secrets detected in build output or repo code!`))
})
