import fs from 'fs/promises'
import path from 'path'

import { Fixture, normalizeOutput, type Request } from '@netlify/testing'
import { expect, test } from 'vitest'

interface SecretsScanReport {
  scannedFilesCount: number
  secretsScanMatches: unknown[]
  enhancedSecretsScanMatches: unknown[]
}

const isValidationsReport = (body: object): body is { secrets_scan: SecretsScanReport } => 'secrets_scan' in body

const getSecretsScan = ({ body }: Request): SecretsScanReport => {
  if (typeof body === 'string' || !isValidationsReport(body)) {
    throw new Error('Validations report request body is missing "secrets_scan"')
  }
  return body.secrets_scan
}

test('secrets scanning, should not run when disabled', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_disabled')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(normalizeOutput(output)).not.toContain('Scanning for secrets in code and build output')
})

test('secrets scanning, should skip with secrets but SECRETS_SCAN_ENABLED=false', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_disabled')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  expect(normalizeOutput(output)).toContain('Secrets scanning disabled via SECRETS_SCAN_ENABLED flag set to false.')
})

test('secrets scanning, should skip when secrets passed but no env vars set', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_default')
    .withFlags({ debug: false, explicitSecretKeys: 'abc,DEF' })
    .runWithBuild()
  expect(normalizeOutput(output)).toContain(
    'Secrets scanning skipped because no env vars marked as secret are set to non-empty/non-trivial values or they are all omitted with SECRETS_SCAN_OMIT_KEYS env var setting.',
  )
})

test('secrets scanning, should skip when secrets passed but no non-empty/trivial env vars set', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_env_vars_set_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_,2ENV_VAR_3,ENV_VAR_4,ENV_VAR_5',
    })
    .runWithBuild()
  expect(normalizeOutput(output)).toContain(
    'Secrets scanning skipped because no env vars marked as secret are set to non-empty/non-trivial values or they are all omitted with SECRETS_SCAN_OMIT_KEYS env var setting.',
  )
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_KEYS omits all of them', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_omit_all_keys')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  expect(normalizeOutput(output)).toContain('SECRETS_SCAN_OMIT_KEYS override option set to: ENV_VAR_2,ENV_VAR_1')
  expect(normalizeOutput(output)).toContain(
    'Secrets scanning skipped because no env vars marked as secret are set to non-empty/non-trivial values or they are all omitted with SECRETS_SCAN_OMIT_KEYS env var setting.',
  )
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_PATHS omits all files', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_omit_all_paths')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  expect(normalizeOutput(output)).toContain('SECRETS_SCAN_OMIT_PATHS override option set to: /external/path')
  expect(normalizeOutput(output)).toContain(
    'Secrets scanning skipped because there are no files or all files were omitted with SECRETS_SCAN_OMIT_PATHS env var setting.',
  )
})

test('secrets scanning, should skip when secrets passed but SECRETS_SCAN_OMIT_PATHS omits globbed files', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_omit_glob_path')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()

  expect(normalizeOutput(output)).not.toContain('found value at line 1 in dist/safefile.js')
  expect(normalizeOutput(output)).not.toContain('found value at line 1 in src/static-files/safefile.js')

  // Ensure SECRETS_SCAN_OMIT_PATHS doesn't exclude more than the defined glob
  expect(normalizeOutput(output)).toContain('found value at line 1 in src/static-files/notsafefile.js')
})

test('secrets scanning, should fail build and report to API when it finds secrets in the src and build output', async () => {
  const { output, requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })
  expect(normalizeOutput(output)).toContain(
    'Scanning complete. 14 file(s) scanned. Secrets scanning found 6 instance(s) of secrets in build output or repo code.',
  )
  expect(normalizeOutput(output)).toContain(
    `Secret env var "ENV_VAR_1"'s value detected:\n` +
      `  found value at line 12 in dist/static-files/static-a.txt\n` +
      `  found value at line 6 in netlify.toml\n` +
      `  found value at line 12 in src/static-files/static-a.txt\n`,
  )
  expect(normalizeOutput(output)).toContain(
    `Secret env var "ENV_VAR_2"'s value detected:\n` +
      `  found value at line 1 in dist/some-file.txt\n` +
      `  found value at line 1 in dist/static-files/static-a.txt\n` +
      `  found value at line 6 in dist/static-files/static-a.txt\n` +
      `  found value at line 7 in netlify.toml\n` +
      `  found value at line 1 in src/some-file.txt\n` +
      `  found value at line 1 in src/static-files/static-a.txt\n` +
      `  found value at line 6 in src/static-files/static-a.txt\n`,
  )
  expect(normalizeOutput(output)).toContain(
    `Secret env var "ENV_VAR_3"'s value detected:\n` +
      `  found value at line 14 in dist/static-files/static-a.txt\n` +
      `  found value at line 16 in dist/static-files/static-a.txt\n` +
      `  found value at line 1 in dist/static-files/static-c.txt\n` +
      `  found value at line 8 in netlify.toml\n` +
      `  found value at line 14 in src/static-files/static-a.txt\n` +
      `  found value at line 16 in src/static-files/static-a.txt\n` +
      `  found value at line 1 in src/static-files/static-c.txt\n`,
  )
  expect(normalizeOutput(output)).toContain(
    `Secret env var "ENV_VAR_4"'s value detected:\n` +
      `  found value at line 20 in dist/static-files/static-a.txt\n` +
      `  found value at line 9 in netlify.toml\n` +
      `  found value at line 20 in src/static-files/static-a.txt\n`,
  )
  expect(normalizeOutput(output)).toContain(
    `Secret env var "ENV_VAR_MULTILINE_A"'s value detected:\n` +
      `  found value at line 17 in dist/static-files/static-c.txt\n` +
      `  found value at line 38 in dist/static-files/static-c.txt\n` +
      `  found value at line 1 in dist/static-files/static-d.txt\n` +
      `  found value at line 15 in netlify.toml\n` +
      `  found value at line 17 in src/static-files/static-c.txt\n` +
      `  found value at line 38 in src/static-files/static-c.txt\n` +
      `  found value at line 1 in src/static-files/static-d.txt\n`,
  )
  expect(normalizeOutput(output)).toContain(
    `Secret env var "ENV_VAR_MULTILINE_B"'s value detected:\n` +
      `  found value at line 4 in dist/static-files/static-d.txt\n` +
      `  found value at line 1 in dist/static-files/static-e.txt\n` +
      `  found value at line 21 in netlify.toml\n` +
      `  found value at line 4 in src/static-files/static-d.txt\n` +
      `  found value at line 1 in src/static-files/static-e.txt\n`,
  )

  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(request.method).toBe('PATCH')
  expect(request.url).toBe('/api/v1/deploys/test/validations_report')
  expect(getSecretsScan(request).scannedFilesCount).toBeTruthy()
  expect(getSecretsScan(request).secretsScanMatches).toHaveLength(32)
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toHaveLength(0)
})

test('secrets scanning should report success to API when no secrets are found', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_env_vars_no_matches')
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2',
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(request.method).toBe('PATCH')
  expect(request.url).toBe('/api/v1/deploys/test/validations_report')
  expect(getSecretsScan(request).scannedFilesCount).toBeTruthy()
  expect(getSecretsScan(request).secretsScanMatches).toBeTruthy()
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toBeTruthy()
})

test('secrets scanning failure should produce an user error', async () => {
  const { severityCode } = await new Fixture(import.meta.url, './fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
    })
    .runBuildProgrammatic()
  // Severity code of 2 is user error
  expect(severityCode).toBe(2)
})

test('secrets scan does not send report to API for local builds', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_env_vars_set_non_empty')
    .withFlags({
      debug: false,
      explicitSecretKeys:
        'ENV_VAR_MULTILINE_A,ENV_VAR_1,ENV_VAR_2,ENV_VAR_3,ENV_VAR_4,ENV_VAR_5,ENV_VAR_6,ENV_VAR_MULTILINE_B',
      deployId: '0',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/0/validations_report' })

  expect(requests).toHaveLength(0)
})

test('secrets scanning, should not fail if the secrets values are not detected in the build output', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_env_vars_no_matches')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  expect(output).toContain(`No secrets detected in build output or repo code!`)
})

test('secrets scanning should not scan .cache/ directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/src_scanning_omit_cache_path')
    .withFlags({ debug: false, explicitSecretKeys: 'ENV_VAR_1,ENV_VAR_2' })
    .runWithBuild()
  expect(output).toContain(`No secrets detected in build output or repo code!`)
})

test('secrets scanning, enhanced scan should not run when disabled', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_disabled')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })
  expect(requests).toHaveLength(0)
})

test('secrets scanning, should skip when enhanced scan and likely secrets passed but SECRETS_SCAN_OMIT_PATHS omits all files', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_omit_all_paths')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(requests).toHaveLength(0)
})

test('secrets scanning, enhanced scan should not find matches when disabled with SECRETS_SCAN_SMART_DETECTION_ENABLED set to false', async () => {
  const { requests } = await new Fixture(
    import.meta.url,
    './fixtures/src_scanning_likely_enhanced_scan_secrets_disabled',
  )
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })
  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toHaveLength(0)
})

test('secrets scanning, enhanced scan should skip matches defined in SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES', async () => {
  const { requests, output } = await new Fixture(
    import.meta.url,
    './fixtures/src_scanning_likely_enhanced_scan_secrets_omitted',
  )
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(normalizeOutput(output)).toContain('SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES override option set')
  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toHaveLength(0)
})

test('secrets scanning, SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES not logged if enhanced scanning not enabled', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/src_scanning_likely_enhanced_scan_secrets_omitted')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: false,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(normalizeOutput(output)).not.toContain('SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES override option set')
})

test('secrets scanning, should run when enhanced scan enabled and no env vars set', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_default')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(request.url).toBe('/api/v1/deploys/test/validations_report')
  expect(getSecretsScan(request).scannedFilesCount).toBeTruthy()
  expect(getSecretsScan(request).secretsScanMatches).toBeTruthy()
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toBeTruthy()
})

test('secrets scanning, should not find secrets in files without known prefixes', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_no_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(request.method).toBe('PATCH')
  expect(request.url).toBe('/api/v1/deploys/test/validations_report')
  expect(getSecretsScan(request).scannedFilesCount).toBeTruthy()
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toHaveLength(0)
})

test('secrets scanning, run and report result to API when there are no secrets and enhanced scan is enabled with likely secrets', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(request.method).toBe('PATCH')
  expect(request.url).toBe('/api/v1/deploys/test/validations_report')
  expect(getSecretsScan(request).scannedFilesCount).toBeTruthy()
  expect(getSecretsScan(request).secretsScanMatches).toBeTruthy()
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toBeTruthy()
})

test('secrets scanning, should fail build and report to API when enhanced scan finds likely secret in the src and build output', async () => {
  const { output, requests } = await new Fixture(
    import.meta.url,
    './fixtures/src_scanning_likely_enhanced_scan_secrets',
  )
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(normalizeOutput(output)).toContain(`"sk_***" detected as a likely secret`)
  expect(normalizeOutput(output)).toContain(
    `the build will fail until these likely secret values are not found in build output or repo files`,
  )
  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(request.method).toBe('PATCH')
  expect(request.url).toBe('/api/v1/deploys/test/validations_report')
  expect(getSecretsScan(request).scannedFilesCount).toBeTruthy()
  expect(getSecretsScan(request).secretsScanMatches).toHaveLength(0)
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toHaveLength(1)
})

test('secrets scanning, should report success to API when enhanced scans finds no likely secrets', async () => {
  const { requests } = await new Fixture(import.meta.url, './fixtures/src_scanning_env_vars_no_matches')
    .withFlags({
      debug: false,
      enhancedSecretScan: true,
      deployId: 'test',
      token: 'test',
    })
    .runBuildServer({ path: '/api/v1/deploys/test/validations_report' })

  expect(requests).toHaveLength(1)
  const request = requests[0]
  expect(request.method).toBe('PATCH')
  expect(request.url).toBe('/api/v1/deploys/test/validations_report')
  expect(getSecretsScan(request).scannedFilesCount).toBeTruthy()
  expect(getSecretsScan(request).secretsScanMatches).toBeTruthy()
  expect(getSecretsScan(request).enhancedSecretsScanMatches).toBeTruthy()
})

test('secrets scanning, enhanced scanning failure should produce a user error', async () => {
  const { severityCode } = await new Fixture(import.meta.url, './fixtures/src_scanning_likely_enhanced_scan_secrets')
    .withFlags({
      debug: false,
      explicitSecretKeys: '',
      enhancedSecretScan: true,
    })
    .runBuildProgrammatic()
  // Severity code of 2 is user error
  expect(severityCode).toBe(2)
})

test('secrets scanning, does not crash if line in scanned file exceed available memory', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/src_scanning_large_binary_file')
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

  expect(normalizeOutput(output)).toContain(
    `Secret env var "ENV_SECRET"'s value detected:\n` + `  found value at line 1 in dist/out.txt\n`,
  )
})

test('secrets scanning, does not check in gitignored', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_scanning_omit_ignored').withCopyRoot()
  const { repositoryRoot } = fixture
  await fs.writeFile(path.join(repositoryRoot, '.gitignore'), 'src/skip')

  const output = await fixture
    .withFlags({
      debug: false,
      explicitSecretKeys: 'ENV_VAR_1',
      cwd: fixture.repositoryRoot,
    })
    .runWithBuild()

  expect(normalizeOutput(output)).not.toContain('found value at line 1 in src/skip/unsafe.js')
})
