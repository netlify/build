import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('secrets scanning, should not run when disabled', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_disabled').withFlags({ debug: false }).runWithBuild()
  t.false(normalizeOutput(output).includes('Scanning for secrets in code and build output'))
})

test('secrets scanning, should skip with secrets but SECRETS_SCAN_ENABLED=false', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_disabled')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.true(normalizeOutput(output).includes('Secrets scanning disabled via SECRETS_SCAN_ENABLED flag set to false.'))
})

test('secrets scanning, should skip when secrets passed but no env vars set', async (t) => {
  const output = await new Fixture('./fixtures/src_default')
    .withFlags({ debug: false, explicitSecretKeys: 'abc,DEF' })
    .runWithBuild()
  t.true(
    normalizeOutput(output).includes(
      'Secrets scanning skipped because no env vars marked as secret are set to non-empty/non-trivial values or they are all omitted with SECRETS_SCAN_OMIT_KEYS env var setting.',
    ),
  )
})

test('secrets scanning, should skip when secrets passed but no non-empty/trivial env vars set', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_env_vars_set_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_,2ENV_VAR_3,ENV_VAR_4,ENV_VAR_5',
    })
    .runWithBuild()
  t.true(
    normalizeOutput(output).includes(
      'Secrets scanning skipped because no env vars marked as secret are set to non-empty/non-trivial values or they are all omitted with SECRETS_SCAN_OMIT_KEYS env var setting.',
    ),
  )
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_KEYS omits all of them', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_all_keys')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.true(normalizeOutput(output).includes('SECRETS_SCAN_OMIT_KEYS override option set to: ENV_VAR_2,ENV_VAR_1'))
  t.true(
    normalizeOutput(output).includes(
      'Secrets scanning skipped because no env vars marked as secret are set to non-empty/non-trivial values or they are all omitted with SECRETS_SCAN_OMIT_KEYS env var setting.',
    ),
  )
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_PATHS omits all files', async (t) => {
  const output = await new Fixture('./fixtures/src_scanning_omit_all_paths')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  t.true(normalizeOutput(output).includes('SECRETS_SCAN_OMIT_PATHS override option set to: /external/path'))
  t.true(
    normalizeOutput(output).includes(
      'Secrets scanning skipped because there are no files or all files were omitted with SECRETS_SCAN_OMIT_PATHS env var setting.',
    ),
  )
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
  t.true(
    normalizeOutput(output).includes(
      'Scanning complete. 14 file(s) scanned. Secrets scanning found 6 instance(s) of secrets in build output or repo code.',
    ),
  )
  t.true(
    normalizeOutput(output).includes(
      `Secret env var "ENV_VAR_1"'s value detected:\n` +
        `  found value at line 12 in dist/static-files/static-a.txt\n` +
        `  found value at line 6 in netlify.toml\n` +
        `  found value at line 12 in src/static-files/static-a.txt\n`,
    ),
  )
  t.true(
    normalizeOutput(output).includes(
      `Secret env var "ENV_VAR_2"'s value detected:\n` +
        `  found value at line 1 in dist/some-file.txt\n` +
        `  found value at line 1 in dist/static-files/static-a.txt\n` +
        `  found value at line 6 in dist/static-files/static-a.txt\n` +
        `  found value at line 7 in netlify.toml\n` +
        `  found value at line 1 in src/some-file.txt\n` +
        `  found value at line 1 in src/static-files/static-a.txt\n` +
        `  found value at line 6 in src/static-files/static-a.txt\n`,
    ),
  )
  t.true(
    normalizeOutput(output).includes(
      `Secret env var "ENV_VAR_3"'s value detected:\n` +
        `  found value at line 14 in dist/static-files/static-a.txt\n` +
        `  found value at line 16 in dist/static-files/static-a.txt\n` +
        `  found value at line 1 in dist/static-files/static-c.txt\n` +
        `  found value at line 8 in netlify.toml\n` +
        `  found value at line 14 in src/static-files/static-a.txt\n` +
        `  found value at line 16 in src/static-files/static-a.txt\n` +
        `  found value at line 1 in src/static-files/static-c.txt\n`,
    ),
  )
  t.true(
    normalizeOutput(output).includes(
      `Secret env var "ENV_VAR_4"'s value detected:\n` +
        `  found value at line 20 in dist/static-files/static-a.txt\n` +
        `  found value at line 9 in netlify.toml\n` +
        `  found value at line 20 in src/static-files/static-a.txt\n`,
    ),
  )
  t.true(
    normalizeOutput(output).includes(
      `Secret env var "ENV_VAR_MULTILINE_A"'s value detected:\n` +
        `  found value at line 17 in dist/static-files/static-c.txt\n` +
        `  found value at line 38 in dist/static-files/static-c.txt\n` +
        `  found value at line 1 in dist/static-files/static-d.txt\n` +
        `  found value at line 15 in netlify.toml\n` +
        `  found value at line 17 in src/static-files/static-c.txt\n` +
        `  found value at line 38 in src/static-files/static-c.txt\n` +
        `  found value at line 1 in src/static-files/static-d.txt\n`,
    ),
  )
  t.true(
    normalizeOutput(output).includes(
      `Secret env var "ENV_VAR_MULTILINE_B"'s value detected:\n` +
        `  found value at line 4 in dist/static-files/static-d.txt\n` +
        `  found value at line 1 in dist/static-files/static-e.txt\n` +
        `  found value at line 21 in netlify.toml\n` +
        `  found value at line 4 in src/static-files/static-d.txt\n` +
        `  found value at line 1 in src/static-files/static-e.txt\n`,
    ),
  )

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.method, 'PATCH')
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.is(request.body.secrets_scan.secretsScanMatches.length, 32)
  t.is(request.body.secrets_scan.enhancedSecretsScanMatches.length, 0)
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

// Enhanced secret scanning with enhanced_secret_scan_impacts_builds enabled

test('secrets scanning, enhanced scan should not run when disabled', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_disabled')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })
  t.true(requests.length === 0)
})

test('secrets scanning, should skip when enhanced scan and likely secrets passed but SECRETS_SCAN_OMIT_PATHS omits all files', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_omit_all_paths')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('secrets scanning, enhanced scan should not find matches when disabled with SECRETS_SCAN_SMART_DETECTION_ENABLED set to false', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets_disabled')
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })
  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.body.secrets_scan.enhancedSecretsScanMatches.length, 0)
})

test('secrets scanning, enhanced scan should skip matches defined in SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets_omitted')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(normalizeOutput(output).includes('SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES override option set'))
  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.body.secrets_scan.enhancedSecretsScanMatches.length, 0)
})

test('secrets scanning, SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES not logged if enhanced scanning not enabled', async (t) => {
  const { output } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets_omitted')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: false,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.false(normalizeOutput(output).includes('SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES override option set'))
})

test('secrets scanning, should run when enhanced scan enabled and no env vars set', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_default')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.truthy(request.body.secrets_scan.secretsScanMatches)
  t.truthy(request.body.secrets_scan.enhancedSecretsScanMatches)
})

test('secrets scanning, should not find secrets in files without known prefixes', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_no_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.method, 'PATCH')
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.is(request.body.secrets_scan.enhancedSecretsScanMatches.length, 0)
})

test('secrets scanning, run and report result to API when there are no secrets and enhanced scan is enabled with likely secrets', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
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

test('secrets scanning, should fail build and report to API when enhanced scan finds likely secret in the src and build output', async (t) => {
  const { output, requests } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.assert(normalizeOutput(output).includes(`"sk_***" detected as a likely secret`))
  t.assert(
    normalizeOutput(output).includes(
      `the build will fail until these likely secret values are not found in build output or repo files`,
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

test('secrets scanning, should report success to API when enhanced scans finds no likely secrets', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_env_vars_no_matches')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
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

test('secrets scanning, enhanced scanning failure should produce a user error', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      featureFlags: { enhanced_secret_scan_impacts_builds: true },
    })
    .runBuildProgrammatic()
  // Severity code of 2 is user error
  t.is(severityCode, 2)
})

// enhanced scanning enabled, but without impact to builds

test('secrets scanning, should not log enhanced scan info when enhanced_secret_scan_impacts_builds is false', async (t) => {
  const { output } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      featureFlags: { enhanced_secret_scan_impacts_builds: false },
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  const normalizedOutput = normalizeOutput(output)
  t.false(normalizedOutput.includes('detected as a likely secret'))
})

test('secrets scanning, should not fail build when enhanced scan finds likely secrets but enhanced_secret_scan_impacts_builds is false', async (t) => {
  const { severityCode } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      featureFlags: { enhanced_secret_scan_impacts_builds: false },
    })
    .runBuildProgrammatic()

  // Severity code of 0 means success, 2 would be user error
  t.is(severityCode, 0)
})

test('secrets scanning, should not log omit values message when enhanced_secret_scan_impacts_builds is false', async (t) => {
  const { output } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets_omitted')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      featureFlags: { enhanced_secret_scan_impacts_builds: false },
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.false(normalizeOutput(output).includes('ENHANCED_SECRETS_SCAN_OMIT_VALUES'))
})

test('secrets scanning, should run enhanced scan in passive mode when explicit keys are present', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1',
      enhancedSecretScan: true,
      featureFlags: { enhanced_secret_scan_impacts_builds: false },
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 1)
  const request = requests[0]
  t.is(request.url, '/api/v1/deploys/test/validations_report')
  t.truthy(request.body.secrets_scan.scannedFilesCount)
  t.truthy(request.body.secrets_scan.enhancedSecretsScanMatches)
})

test('secrets scanning, should not run enhanced scan in passive mode when no explicit keys', async (t) => {
  const { requests } = await new Fixture('./fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      featureFlags: { enhanced_secret_scan_impacts_builds: false },
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  t.true(requests.length === 0)
})

test('does not crash if line in scanned file exceed available memory', async (t) => {
  const { output } = await new Fixture('./fixtures/src_scanning_large_binary_file')
    .withEnv({
      // fixture produces a ~256MB file with single line, so this intentionally limits available memory
      // to check if scanner can process it without crashing
      NODE_OPTIONS: '--max-old-space-size=128',
    })
    .withFlags({
      debug: false,
      defaultConfig: JSON.stringify({ build: { environment: { ENV_SECRET: 'this is a secret' } } }),
      explicitSecretKeys: 'ENV_SECRET',
    })
    .runBuildBinary()

  t.assert(
    normalizeOutput(output).includes(
      `Secret env var "ENV_SECRET"'s value detected:\n` + `  found value at line 1 in dist/out.txt\n`,
    ),
    'Scanning should find a secret, instead got: ' + normalizeOutput(output),
  )
})
